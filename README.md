# MAANG Interview Prep Tracker 🎯

A **local web application** for tracking structured MAANG (Meta, Apple, Amazon, Netflix, Google) interview preparation for experienced software engineers.

> **📌 Note:** The `main` branch is a **clean template** with no user data. Your progress is stored in your **browser's LocalStorage** and is not tracked in git. For personal progress tracking, create your own branch (e.g., `progress/YOUR_NAME`).

## ✨ Features

- **125+ Curated Problems** with real links to LeetCode, HackerRank, GeeksForGeeks
- **Three Main Categories:**
  - 📊 Data Structures & Algorithms (80+ problems)
  - 🏗️ System Design (30+ tasks)
  - 💬 Behavioral/Engineering Maturity (15+ scenarios)
- **Progress Tracking** with checkboxes and completion stats
- **Personal Notes** for each problem
- **Custom Problem Addition** to extend the problem set
- **Portfolio Page** to showcase your preparation progress
- **Export/Import** functionality for data backup
- **Toggle Features** for difficulty and time estimates (OFF by default)
- **100% Local** - No external APIs, no login required
- **LocalStorage** persistence - all data saved in your browser

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Navigate to the project folder:**
   ```bash
   cd /Users/karupal/Documents/Personal/MAANG
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

That's it! Your interview prep tracker is now running locally.

## 📁 Project Structure

```
maang-prep-tracker/
├── server.js                 # Express server
├── package.json             # Dependencies
├── data/
│   └── problems.json        # 125+ curated problems with real links
├── public/
│   ├── index.html          # Main dashboard
│   ├── portfolio.html      # Portfolio/proof page
│   ├── css/
│   │   └── styles.css      # Clean, minimal styling
│   └── js/
│       ├── app.js          # Main app logic
│       ├── storage.js      # LocalStorage manager
│       ├── portfolio.js    # Portfolio page logic
│       └── settings.js     # Toggle features (difficulty, time)
└── README.md               # This file
```

## 📚 Problem Categories

### Data Structures & Algorithms (80+ problems)

- **Arrays & Strings**
  - Two Pointers (8 problems)
  - Sliding Window (8 problems)
  - Prefix Sum (8 problems)
- **Linked List** (10 problems)
- **Stack & Queue** (10 problems)
- **Hashing & Sets** (8 problems)
- **Trees** (10 problems)
- **Graphs** (10 problems)
- **Recursion & Backtracking** (8 problems)
- **Dynamic Programming** (10 problems)

### System Design (30+ tasks)

- URL Shortener (4 tasks)
- Feed System (4 tasks)
- Chat System (4 tasks)
- Caching Strategies (3 tasks)
- Database Design (4 tasks)
- Sharding & Replication (3 tasks)
- Pub/Sub & Queues (4 tasks)
- API Design (4 tasks)

### Behavioral / Engineering Maturity (15+ scenarios)

- Debugging Stories (5 scenarios)
- Trade-off Discussions (5 scenarios)
- Ownership Examples (5 scenarios)

## 🎓 Problem Types

Each problem is categorized by type:

- **Solve** - Code the solution
- **Read & Understand** - Study and comprehend
- **Explain Verbally** - Practice articulating the solution
- **Whiteboard Dry Run** - Simulate interview whiteboarding
- **Design & Discuss** - System design discussions

## 🔧 How to Use

### 1. Dashboard

- Select a topic from the left sidebar
- View problems in the main content area
- Check off completed problems
- Add personal notes to each problem
- Filter by All/Pending/Completed

### 2. Settings (⚙️ button)

**Display Options (OFF by default):**
- ☐ Show Difficulty (Easy/Medium/Hard)
- ☐ Show Estimated Time (minutes)

**Data Management:**
- 📥 Export Progress (JSON backup)
- 📤 Import Progress (restore from backup)
- 🗑️ Reset All Progress (with confirmation)

### 3. Portfolio Page (📊 button)

View your comprehensive preparation summary:
- Overall completion statistics
- Category-wise progress breakdown
- Topic-wise progress bars
- Recent activity timeline
- Difficulty distribution
- Problem type completion stats
- Export summary as JSON
- Print-friendly view

### 4. Custom Problems

- Click "➕ Add Custom Problem" button
- Fill in problem details (title, link, type, etc.)
- Optional: Add difficulty and estimated time
- Custom problems integrate seamlessly with the tracker

## 💾 Data Management

### Backup Your Progress

1. Click ⚙️ Settings
2. Click "📥 Export Progress"
3. Save the JSON file to a safe location

### Restore Your Progress

1. Click ⚙️ Settings
2. Click "📤 Import Progress"
3. Select your backup JSON file

### Reset Progress

- **Per Topic:** Click "🔄 Reset Topic Progress" in the main content area
- **All Progress:** Settings → "🗑️ Reset All Progress" (requires double confirmation)

## 🎯 6-Month MAANG Preparation Strategy

Based on your current level (364 LeetCode problems solved, 3 YOE):

### Recommended Pace
- **Problems per week:** 4-6 problems (sustainable pace)
- **System design:** 1-2 topics per week
- **Behavioral prep:** 1 scenario per week

### Focus Areas
1. **Weeks 1-8:** Arrays, Strings, Two Pointers, Sliding Window
2. **Weeks 9-16:** Trees, Graphs, Dynamic Programming
3. **Weeks 17-20:** System Design fundamentals
4. **Weeks 21-24:** Advanced System Design + Mock interviews
5. **Weeks 25-26:** Review, practice, polish

### Quality Over Quantity
- Understand patterns, not just solutions
- Practice explaining your thought process
- Time yourself during practice
- Review and redo difficult problems

## 🖥️ Tech Stack

- **Backend:** Node.js + Express (minimal server)
- **Frontend:** HTML + CSS + Vanilla JavaScript
- **Storage:** LocalStorage (browser-based)
- **Data:** Static JSON file (no database needed)

## 📊 Portfolio as Proof

The Portfolio page provides exportable proof of your structured preparation:
- Show percentage completion by category
- Demonstrate systematic approach
- Evidence of diverse problem-solving skills
- Timeline of consistent effort

**Perfect for:**
- LinkedIn updates
- Interview discussions
- Resume talking points
- Personal motivation

## 🔒 Privacy & Data

- **100% Local:** All data stored in your browser's LocalStorage
- **No Tracking:** Zero analytics or external requests
- **No Login:** No accounts, no authentication required
- **Your Data:** Export anytime, own your progress

### 📂 Personal Progress Branches

Since progress is stored in **browser LocalStorage** (not in git), you can work on any branch:

**For Personal Use:**
```bash
# Create your personal progress branch
git checkout -b progress/YOUR_NAME

# Work and track your progress
# (All progress stays in your browser's LocalStorage)

# Push your branch (optional - for backup/sync)
git push -u origin progress/YOUR_NAME
```

**For Team/Friends:**
- Clone the repository from `main` branch
- Each person creates their own `progress/NAME` branch
- The `main` branch stays clean for everyone to use
- Progress is personal and local to each browser

## 🛠️ Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon to auto-restart the server on file changes.

### Modifying Problems

Edit `data/problems.json` to add/modify/remove problems. The structure is:

```json
{
  "categories": [
    {
      "id": "category-id",
      "name": "Category Name",
      "topics": [
        {
          "id": "topic-id",
          "name": "Topic Name",
          "subtopics": [
            {
              "id": "subtopic-id",
              "name": "Subtopic Name",
              "problems": [
                {
                  "id": "unique-problem-id",
                  "title": "Problem Title",
                  "difficulty": "easy|medium|hard",
                  "estimatedTime": 30,
                  "type": "solve|read|explain|whiteboard|design",
                  "links": [
                    {
                      "platform": "LeetCode",
                      "url": "https://..."
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## 🐛 Troubleshooting

### Server won't start
- Make sure Node.js is installed: `node --version`
- Check if port 3000 is available
- Run `npm install` again

### Data not persisting
- Check browser LocalStorage is enabled
- Try exporting data as backup
- Clear browser cache and import backup

### Can't see problems
- Check browser console for errors
- Ensure `data/problems.json` exists
- Verify JSON syntax is valid

## 📝 License

MIT License - Feel free to modify and use for personal interview preparation.

## 🙏 Acknowledgments

Problem links curated from:
- LeetCode
- HackerRank
- GeeksForGeeks
- Codeforces

## 💡 Tips for Success

1. **Consistency > Intensity:** Better to solve 5 problems weekly for 6 months than 50 in 2 weeks
2. **Understand Patterns:** Focus on recognizing problem patterns
3. **Time Yourself:** Practice with time constraints
4. **Explain Out Loud:** Practice verbalizing your approach
5. **Review Mistakes:** Learn from problems you couldn't solve
6. **System Design:** Don't neglect this - crucial for 3+ YOE roles
7. **Behavioral Prep:** Prepare STAR format stories
8. **Mock Interviews:** Practice with peers or platforms

## 🎓 Additional Resources

- **Books:**
  - "Cracking the Coding Interview" by Gayle Laakmann McDowell
  - "System Design Interview" by Alex Xu
  
- **Platforms:**
  - LeetCode Premium (company-specific questions)
  - Pramp (free mock interviews)
  - interviewing.io (anonymous mock interviews)

## 📞 Support

For issues or suggestions:
1. Check the troubleshooting section
2. Review browser console errors
3. Export your data as backup before making changes

---

**Good luck with your MAANG interview preparation! 🚀**

*Remember: This tracker is a tool - your dedication and consistent effort are what will get you the offer.*

