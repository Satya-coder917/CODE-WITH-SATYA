// ==========================================
// FitCampus AI - FINAL SCRIPT
// Firebase + Dashboard + Gamification
// ==========================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";


// ==========================================
// FIREBASE CONFIG
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyDyT1YJI16_H_LfxFHk0NT5Sj9dvRliebQ",
    authDomain: "fitcampus-ai-32e5d.firebaseapp.com",
    projectId: "fitcampus-ai-32e5d",
    storageBucket: "fitcampus-ai-32e5d.firebasestorage.app",
    messagingSenderId: "116058395606",
    appId: "1:116058395606:web:a88d985efb717fb358a77"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

let userData = {
    steps: 0,
    water: 0,
    points: 0,
    streak: 0,
    challenges: 0,
    badges: 0
};


// ==========================================
// AUTH STATE
// ==========================================

onAuthStateChanged(auth, async (user) => {

    currentUser = user;

    // Login/Register page
    if (!document.getElementById("stepsCount")) {
        return;
    }

    // Dashboard
    if (!user) {
        window.location.href = "Login.html";
        return;
    }

    const email = document.getElementById("userEmail");

    if (email) {
        email.innerText = "Logged in as: " + user.email;
    }

    await loadUserData();

});


// ==========================================
// LOAD USER DATA
// ==========================================

async function loadUserData() {

    if (!currentUser) return;

    try {

        const userRef = doc(
            db,
            "users",
            currentUser.uid
        );

        const snap = await getDoc(userRef);

        if (snap.exists()) {

            const data = snap.data();

            userData.steps =
                Number(data.steps || 0);

            userData.water =
                Number(data.water || 0);

            userData.points =
                Number(data.points || 0);

            userData.streak =
                Number(data.streak || 0);

            userData.challenges =
                Number(data.challenges || 0);

            userData.badges =
                Number(data.badges || 0);

        } else {

            await saveUserData();

        }

        updateDashboard();

    } catch (error) {

        console.error(
            "Firebase load error:",
            error
        );

        alert(
            "❌ Firebase data load failed:\n" +
            error.message
        );
    }
}


// ==========================================
// SAVE USER DATA
// ==========================================

async function saveUserData() {

    if (!currentUser) return;

    const userRef = doc(
        db,
        "users",
        currentUser.uid
    );

    await setDoc(
        userRef,
        {
            name:
                currentUser.displayName || "Student",

            email:
                currentUser.email,

            uid:
                currentUser.uid,

            steps:
                userData.steps,

            water:
                userData.water,

            points:
                userData.points,

            streak:
                userData.streak,

            challenges:
                userData.challenges,

            badges:
                userData.badges,

            updatedAt:
                new Date()
        },
        {
            merge: true
        }
    );
}


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard() {

    setText(
        "stepsCount",
        userData.steps
    );

    setText(
        "waterCount",
        userData.water + " / 8"
    );

    setText(
        "streakCount",
        userData.streak + " Days"
    );

    setText(
        "gamepoint",
        userData.points
    );

    setText(
        "gamePoints",
        userData.points
    );

    setText(
        "leaderboardPoints",
        userData.points
    );

    setText(
        "gamestreak",
        userData.streak + " days"
    );

    setText(
        "gameBadges",
        userData.badges
    );

    updateProgress();

    updateLevel();

}


// ==========================================
// HELPER
// ==========================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.innerText = value;
    }
}


// ==========================================
// UPDATE STEPS
// ==========================================

window.updateSteps = async function () {

    if (!currentUser) {

        alert("❌ Please login first.");
        return;
    }

    const input =
        document.getElementById("stepsInput");

    const steps =
        Number(input.value);

    if (
        isNaN(steps) ||
        steps < 0
    ) {

        alert(
            "Please enter valid steps."
        );

        return;
    }

    userData.steps = steps;

    // Reward only when goal reached
    if (steps >= 6000) {

        userData.points += 50;

    } else {

        userData.points += 10;

    }

    try {

        await saveUserData();

        updateDashboard();

        input.value = "";

        if (steps >= 6000) {

            alert(
                "🎉 Daily step goal completed!\n+50 Points ⭐"
            );

        } else {

            alert(
                "👣 Steps saved successfully!\n+10 Points ⭐"
            );
        }

    } catch (error) {

        alert(
            "❌ Steps save failed:\n" +
            error.message
        );
    }
};


// ==========================================
// ADD WATER
// ==========================================

window.addWater = async function () {

    if (!currentUser) {

        alert("❌ Please login first.");
        return;
    }

    if (userData.water >= 8) {

        alert(
            "💧 Daily water goal completed!"
        );

        return;
    }

    userData.water++;

    userData.points += 5;

    try {

        await saveUserData();

        updateDashboard();

        alert(
            "💧 Water saved successfully!\n+5 Points ⭐"
        );

    } catch (error) {

        alert(
            "❌ Water save failed:\n" +
            error.message
        );
    }
};


// ==========================================
// DAILY CHALLENGE
// ==========================================

window.completeChallenge = async function () {

    if (!currentUser) {

        alert("❌ Please login first.");
        return;
    }

    const button =
        document.getElementById(
            "challengeBtn"
        );

    if (
        button &&
        button.disabled
    ) {

        return;
    }

    userData.challenges++;

    userData.points += 50;

    userData.streak++;

    try {

        await saveUserData();

        updateDashboard();

        if (button) {

            button.innerText =
                "Challenge Completed ✓";

            button.disabled = true;
        }

        const status =
            document.getElementById(
                "challengeStatus"
            );

        if (status) {

            status.innerText =
                "🎉 Challenge completed! +50 Points";
        }

        alert(
            "🎉 Challenge Completed!\n+50 Points ⭐"
        );

    } catch (error) {

        alert(
            "❌ Challenge save failed:\n" +
            error.message
        );
    }
};


// ==========================================
// AI RECOMMENDATION
// ==========================================

window.aiRecommendation = function () {

    const result =
        document.getElementById(
            "aiResult"
        );

    if (!result) return;

    const steps =
        userData.steps;

    let message = "";

    if (steps < 2000) {

        message = `
            <h3>🤖 AI Recommendation</h3>
            <p>
                Your activity is low today.
                🚶 Take a 15-minute walk and do
                5 minutes of stretching.
            </p>
        `;

    } else if (steps < 6000) {

        message = `
            <h3>🤖 AI Recommendation</h3>
            <p>
                Great progress! 👏
                You need
                <strong>${6000 - steps}</strong>
                more steps to reach your goal.
            </p>
        `;

    } else {

        message = `
            <h3>🤖 AI Recommendation</h3>
            <p>
                Excellent! 🎉
                You reached your daily step goal.
                Keep exercising and stay hydrated. 💧
            </p>
        `;
    }

    result.innerHTML = message;
};


// ==========================================
// PROGRESS REPORT
// ==========================================

function updateProgress() {

    const stepsPercent =
        Math.min(
            Math.round(
                (userData.steps / 6000) * 100
            ),
            100
        );

    const waterPercent =
        Math.min(
            Math.round(
                (userData.water / 8) * 100
            ),
            100
        );

    const challengePercent =
        Math.min(
            userData.challenges * 20,
            100
        );

    const streakPercent =
        Math.min(
            userData.streak * 10,
            100
        );


    setBar(
        "stepsProgress",
        stepsPercent
    );

    setBar(
        "waterProgress",
        waterPercent
    );

    setBar(
        "challengeProgress",
        challengePercent
    );

    setBar(
        "streakProgress",
        streakPercent
    );


    setText(
        "stepsPercent",
        stepsPercent + "%"
    );

    setText(
        "waterPercent",
        waterPercent + "%"
    );

    setText(
        "challengePercent",
        challengePercent + "%"
    );

    setText(
        "streakPercent",
        streakPercent + "%"
    );


    setText(
        "stepsProgressText",
        userData.steps +
        " / 6000 steps"
    );

    setText(
        "waterProgressText",
        userData.water +
        " / 8 glasses"
    );
}


function setBar(id, value) {

    const bar =
        document.getElementById(id);

    if (bar) {

        bar.style.width =
            value + "%";
    }
}


// ==========================================
// LEVEL SYSTEM
// ==========================================

function updateLevel() {

    let level = 1;
    let title = "🥉 Beginner";

    if (userData.points >= 500) {

        level = 3;
        title = "🥇 Fitness Champion";

    } else if (
        userData.points >= 200
    ) {

        level = 2;
        title = "🥈 Active Student";
    }

    setText(
        "level",
        title
    );

    setText(
        "gamelevel",
        "Level " + level
    );

}


// ==========================================
// CHATBOT
// ==========================================

window.toggleChat = function () {

    const chat =
        document.getElementById(
            "chatbotBox"
        );

    if (!chat) return;

    if (
        chat.style.display === "block"
    ) {

        chat.style.display = "none";

    } else {

        chat.style.display = "block";
    }
};


window.getFitnessPlan = function () {

    const input =
        document.getElementById(
            "timeInput"
        );

    const messages =
        document.getElementById(
            "chatMessages"
        );

    if (!input || !messages) return;

    const time =
        Number(input.value);

    if (
        !time ||
        time <= 0
    ) {

        alert(
            "Please enter available time."
        );

        return;
    }

    messages.innerHTML += `
        <div class="user-message">
            I have ${time} minutes.
        </div>
    `;

    let plan = "";

    if (time <= 5) {

        plan = `
            <strong>⚡ Quick Fitness</strong><br><br>
            🧘 2 min Stretching<br>
            🏃 2 min Jumping Jacks<br>
            😌 1 min Cool Down
        `;

    } else if (time <= 10) {

        plan = `
            <strong>🔥 10-Minute Fitness</strong><br><br>
            🧘 3 min Stretching<br>
            🏃 3 min Jumping Jacks<br>
            💪 2 min Squats<br>
            😌 2 min Cool Down
        `;

    } else if (time <= 20) {

        plan = `
            <strong>💪 20-Minute Fitness</strong><br><br>
            🧘 5 min Stretching<br>
            🏃 5 min Jumping Jacks<br>
            💪 5 min Squats & Lunges<br>
            🚶 3 min Walking<br>
            😌 2 min Cool Down
        `;

    } else {

        plan = `
            <strong>🏆 ${time}-Minute Fitness Plan</strong><br><br>
            🧘 5 min Warm-up<br>
            🏃 10 min Cardio<br>
            💪 10 min Strength Exercise<br>
            🚶 5 min Walking<br>
            😌 5 min Cool Down<br><br>
            💧 Stay hydrated!
        `;
    }


    setTimeout(() => {

        messages.innerHTML += `
            <div class="bot-message">
                ${plan}
                <br><br>
                ✅ Suggested for you today.
            </div>
        `;

        messages.scrollTop =
            messages.scrollHeight;

    }, 400);

    input.value = "";
};


// ==========================================
// WORKOUT TIMER
// ==========================================

let timeLeft = 180;
let timerInterval = null;


function updateTimer() {

    const timer =
        document.getElementById(
            "timer"
        );

    if (!timer) return;

    const minutes =
        Math.floor(timeLeft / 60);

    const seconds =
        timeLeft % 60;

    timer.innerText =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");


    if (timeLeft <= 0) {

        clearInterval(
            timerInterval
        );

        timerInterval = null;

        setText(
            "timerStatus",
            "🎉 Exercise Complete!"
        );
    }
}


window.startTimer = function () {

    if (timerInterval !== null)
        return;

    setText(
        "timerStatus",
        "🔥 Workout running..."
    );

    timerInterval =
        setInterval(() => {

            timeLeft--;

            updateTimer();

            if (timeLeft <= 0) {

                clearInterval(
                    timerInterval
                );

                timerInterval = null;
            }

        }, 1000);
};


window.pauseTimer = function () {

    clearInterval(
        timerInterval
    );

    timerInterval = null;

    setText(
        "timerStatus",
        "⏸ Workout paused"
    );
};


window.resetTimer = function () {

    clearInterval(
        timerInterval
    );

    timerInterval = null;

    timeLeft = 180;

    updateTimer();

    setText(
        "timerStatus",
        "Ready to workout 💪"
    );
};


// ==========================================
// COMPLETE WORKOUT
// ==========================================

window.completeWorkout = async function () {

    if (!currentUser) {

        alert("❌ Please login first.");
        return;
    }

    clearInterval(
        timerInterval
    );

    timerInterval = null;

    userData.points += 10;

    try {

        await saveUserData();

        updateDashboard();

        setText(
            "timerStatus",
            "🎉 Workout Completed! +10 Points"
        );

        alert(
            "🎉 Great job!\n+10 Fitness Points ⭐"
        );

    } catch (error) {

        alert(
            "❌ Workout save failed:\n" +
            error.message
        );
    }
};


// ==========================================
// LOGOUT
// ==========================================

window.logout = async function () {

    try {

        await signOut(auth);

        window.location.href =
            "index.html";

    } catch (error) {

        alert(
            "❌ Logout failed:\n" +
            error.message
        );
    }
};


// ==========================================
// INITIAL TIMER
// ==========================================

updateTimer();