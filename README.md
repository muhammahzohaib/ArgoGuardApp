# 🌾 ArgoGuard AI

**ArgoGuard AI** is a smart, easy-to-use farming assistant. It uses advanced Artificial Intelligence to help farmers keep their crops healthy, monitor the weather, and make better decisions. 

It is built in two parts:
1. **A Mobile App (Frontend):** Built with Flutter so it works smoothly on your phone.
2. **A Smart Brain (Backend):** Built with Node.js to power all the AI thinking.

---

## ✨ What Can It Do?

- 📸 **Crop Disease Scanner:** Take a picture of your crop, and our AI will tell you if it's sick and exactly how to treat it.
- 🌤️ **Live Weather & Advice:** Gets real-time weather for your farm's location and tells you what to do (like "Don't spray pesticides today, it's too windy!").
- 🤖 **Team of AI Agents:** We use a "team" of different AIs working together. One checks the image, one checks the risks, and another plans the actions to give you the absolute best advice.
- 🛡️ **Failsafe System:** If something goes wrong (like a smart sprinkler losing connection), the system knows how to safely stop and send you an alert.

---

## 🚀 How to Run the Project

Want to try it out on your own computer? Follow these simple steps!

### What you need first:
- **Node.js** (Version 18 or higher)
- **Flutter** (Version 3 or higher)
- A **Gemini API Key** (to make the crop scanning work)

### Step 1: Start the Backend (The Brain)
1. Open your terminal and go into the backend folder:
   ```bash
   cd backend
   ```
2. Install the required files:
   ```bash
   npm install
   ```
3. Add your secret keys: Create a file named `.env` inside the `backend` folder and add your key like this:
   ```text
   GEMINI_API_KEY=your_key_here
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Step 2: Start the App (The Phone Interface)
1. Open a new terminal window and make sure you are in the main project folder.
2. Download the app packages:
   ```bash
   flutter pub get
   ```
3. Run the app on your phone or emulator:
   ```bash
   flutter run
   ```

---

