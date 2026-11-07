import type { BadgeId, LevelId, VoteOption } from "../state/GameContext";

/* ---------- Level map (city buildings) ---------- */
export interface LevelMeta {
  id: LevelId;
  num: number;
  title: string;
  place: string;
  emoji: string;
  color: string;
  tagline: string;
  soundLabel: string;
  objective: string;
}

export const LESSON_OBJECTIVES: { emoji: string; title: string; text: string }[] = [
  {
    emoji: "🗳️",
    title: "1. Understand Online Forms",
    text: "Explain what an online form is and why online forms are faster and easier than paper forms.",
  },
  {
    emoji: "🛠️",
    title: "2. Know the Parts of Google Forms",
    text: "Identify key tools inside a form: Templates, Title, Questions, Voice Input, Preview, Send, and Responses.",
  },
  {
    emoji: "🤖",
    title: "3. Create & Share a Form",
    text: "Design a RoboChallenge feedback form, add questions, share it safely, and check the response charts.",
  },
];

export const LEVELS: LevelMeta[] = [
  {
    id: "L1",
    num: 1,
    title: "Mystery Voting Show",
    place: "Vote Plaza",
    emoji: "🗳️",
    color: "#34a853",
    tagline: "Why do we use online forms?",
    soundLabel: "🎶 Ballot Chime",
    objective: "Learn what an online form is and what parts are inside it, then vote in a live class poll and compare Paper vs. Online forms.",
  },
  {
    id: "L2",
    num: 2,
    title: "Form Master Trivia Tower",
    place: "Trivia Tower",
    emoji: "🏰",
    color: "#673ab7",
    tagline: "Google Forms features & tricks",
    soundLabel: "🎺 Castle Fanfare",
    objective: "Learn the main buttons, tabs, and features of Google Forms, then test your skills in Round A and Round B!",
  },
  {
    id: "L3",
    num: 3,
    title: "RoboChallenge Form Design Lab",
    place: "Robo Lab",
    emoji: "🤖",
    color: "#4285f4",
    tagline: "Create and customize a form",
    soundLabel: "🤖 Robot Bleeps",
    objective: "Explore each part of the Google Forms editor, then build, preview, share, and review responses for the RoboChallenge event.",
  },
  {
    id: "L4",
    num: 4,
    title: "Digital Forms Challenge",
    place: "Game Show Arena",
    emoji: "🎯",
    color: "#ea4335",
    tagline: "The big game show!",
    soundLabel: "🎪 Arena Showtime",
    objective: "Review everything you learned about online forms and score 70% or higher to earn your Form Master Certificate.",
  },
  {
    id: "final",
    num: 5,
    title: "Real-World Classroom Mission",
    place: "Classroom HQ",
    emoji: "🏫",
    color: "#f29900",
    tagline: "Build your real form",
    soundLabel: "🔔 School Bell",
    objective: "Work in pairs at forms.google.com to create your real RoboChallenge Feedback Form step by step.",
  },
  {
    id: "reflect",
    num: 6,
    title: "Think Like a Form Master",
    place: "Idea Park",
    emoji: "💡",
    color: "#00a6a6",
    tagline: "Share your big idea",
    soundLabel: "✨ Idea Harp",
    objective: "Reflect on how online forms save time, organize information, and collect answers easily in daily life.",
  },
];

export function levelMeta(id: LevelId): LevelMeta {
  return LEVELS.find((l) => l.id === id) ?? LEVELS[0];
}

/* ---------- Badges ---------- */
export const BADGES: { id: BadgeId; emoji: string; name: string; how: string }[] = [
  { id: "vote", emoji: "🗳️", name: "Vote Master", how: "Finish the Mystery Voting Show" },
  { id: "trivia", emoji: "🏆", name: "Trivia Champ", how: "Finish the Trivia Tower" },
  { id: "robo", emoji: "🤖", name: "RoboChallenge Form Creator", how: "Finish all 4 RoboLab missions" },
  { id: "certificate", emoji: "🎓", name: "Form Master Certificate", how: "Score 70% or more in the Arena" },
  { id: "classroom", emoji: "🏫", name: "Classroom Form Pro", how: "Finish the classroom checklist" },
  { id: "reflect", emoji: "💡", name: "Big Thinker", how: "Share your big idea" },
];

/* ---------- Level 1: voting ---------- */
export const VOTE_OPTIONS: { id: VoteOption; label: string; emoji: string; color: string }[] = [
  { id: "games", label: "Playing games", emoji: "🎮", color: "#34a853" },
  { id: "computers", label: "Using computers", emoji: "💻", color: "#4285f4" },
  { id: "science", label: "Science experiments", emoji: "🔬", color: "#fbbc04" },
  { id: "art", label: "Art and drawing", emoji: "🎨", color: "#ea4335" },
];

export const LIKE_CHOICES = ["It was fun! 🎉", "It was quick! ⚡", "I could use a tablet! 📱", "It was easy to use! 👍"];

export const FORM_PARTS_L1: { id: string; emoji: string; part: string; whatItIs: string; example: string }[] = [
  {
    id: "title",
    emoji: "🏷️",
    part: "1. Form Title & Description",
    whatItIs: "The title sits at the top of the form. It tells people what the survey or quiz is about.",
    example: "Example: “Favorite School Activity Poll”",
  },
  {
    id: "question",
    emoji: "❓",
    part: "2. The Question",
    whatItIs: "Each card in a form asks a clear question to collect information from people.",
    example: "Example: “What is your favorite school activity?”",
  },
  {
    id: "options",
    emoji: "🔘",
    part: "3. Answer Choices (Options)",
    whatItIs: "People click an option, pick stars, or type their answer on a computer, tablet, or phone.",
    example: "Example: ○ Playing games  ○ Using computers",
  },
  {
    id: "submit",
    emoji: "📤",
    part: "4. Submit & Automatic Chart",
    whatItIs: "When you click Submit, the online form saves your answer and updates the results chart automatically!",
    example: "No counting paper by hand!",
  },
];

/* ---------- Level 2: trivia explanations + questions ---------- */
export const ROUND_A_EXPLAIN: { word: string; emoji: string; whereInForm: string; explanation: string }[] = [
  {
    word: "Send",
    emoji: "📤",
    whereInForm: "Top-right button in Google Forms",
    explanation: "Click the SEND button when your form is ready so you can share it with others by email or link.",
  },
  {
    word: "Responses",
    emoji: "📊",
    whereInForm: "Top tab next to Questions",
    explanation: "Click the RESPONSES tab to view everyone's answers and see automatic charts.",
  },
  {
    word: "Voice",
    emoji: "🎤",
    whereInForm: "Microphone tool on supported devices",
    explanation: "VOICE input lets users speak their answers out loud instead of typing on the keyboard.",
  },
  {
    word: "Templates",
    emoji: "📋",
    whereInForm: "Template Gallery on the home screen",
    explanation: "TEMPLATES are ready-made form designs (like Event Feedback) that help us create professional forms quickly.",
  },
];

export const ROUND_B_EXPLAIN: { title: string; emoji: string; badge: "TRUE" | "FALSE"; explanation: string }[] = [
  {
    title: "Not Just Surveys!",
    emoji: "📝",
    badge: "FALSE",
    explanation: "Online forms are NOT only for surveys—you can also make quizzes, event sign-ups, and feedback forms!",
  },
  {
    title: "Add Pictures & Videos",
    emoji: "🖼️",
    badge: "TRUE",
    explanation: "You CAN add pictures and videos to questions in Google Forms to make them visual and fun.",
  },
  {
    title: "No Special Software Needed",
    emoji: "🌐",
    badge: "FALSE",
    explanation: "You do NOT need to install special software. Google Forms runs right inside your web browser!",
  },
  {
    title: "Team Collaboration",
    emoji: "🤝",
    badge: "TRUE",
    explanation: "More than one person CAN collaborate and build the same Google Form together.",
  },
  {
    title: "Templates Save Time",
    emoji: "⚡",
    badge: "TRUE",
    explanation: "Starting from a template saves time because the layout and sample questions are already made for you.",
  },
  {
    title: "Easy Sharing by Email or Link",
    emoji: "📧",
    badge: "TRUE",
    explanation: "Google Forms CAN be shared by email or by copying a link.",
  },
];

export const ROBOLAB_FORM_GUIDE: { emoji: string; part: string; whatItDoes: string; howToUse: string }[] = [
  {
    emoji: "📋",
    part: "1. Template Gallery",
    whatItDoes: "Gives you ready-made forms so you don't have to start from a blank page.",
    howToUse: "Choose the “Event Feedback” template for RoboChallenge.",
  },
  {
    emoji: "🏷️",
    part: "2. Form Header (Title & Description)",
    whatItDoes: "Shows the name of your event and tells students why they are filling out the form.",
    howToUse: "Change the title to “RoboChallenge” and type a friendly description.",
  },
  {
    emoji: "🔘",
    part: "3. Multiple-Choice Question",
    whatItDoes: "Lets students pick ONE favorite choice from a list of options.",
    howToUse: "Ask: “What was your favorite robotics activity?” with options like Robot Racing.",
  },
  {
    emoji: "⭐",
    part: "4. Rating-Scale Question",
    whatItDoes: "Lets students rate the event from 1 to 5 stars.",
    howToUse: "Ask: “How would you rate the event?” so students can tap 1–5 stars.",
  },
  {
    emoji: "👀",
    part: "5. Preview Button (Eye Icon)",
    whatItDoes: "Shows how your form looks to students who will answer it.",
    howToUse: "Click Preview to test your questions before sharing.",
  },
  {
    emoji: "🚀",
    part: "6. Send Button & Responses Tab",
    whatItDoes: "Send shares your form link/email. Responses shows automatic bar and pie charts of the answers!",
    howToUse: "Click Send/Publish, then open Responses to inspect the charts.",
  },
];

/* ---------- Level 2: trivia ---------- */
export const FILL_BLANKS: { text: string; options: string[]; answer: string }[] = [
  { text: "To share a Google Form, click the ______ button.", options: ["Send", "Delete", "Print"], answer: "Send" },
  { text: "To view people's answers, click the ______ tab.", options: ["Questions", "Responses", "Settings"], answer: "Responses" },
  { text: "______ input allows users to speak their answers on supported devices.", options: ["Voice", "Drawing", "Video"], answer: "Voice" },
  { text: "______ help us create professional forms quickly.", options: ["Templates", "Games", "Folders"], answer: "Templates" },
];

export const TRUE_FALSE: { text: string; answer: boolean; why: string }[] = [
  { text: "Online forms can only be used to create surveys.", answer: false, why: "Forms can also make quizzes, sign-up sheets and feedback forms!" },
  { text: "You can add pictures and videos to questions in Google Forms.", answer: true, why: "Yes! Pictures and videos make questions more fun." },
  { text: "You need to install special software to use Google Forms.", answer: false, why: "Google Forms works in a web browser. No install needed!" },
  { text: "More than one person can collaborate on an online form.", answer: true, why: "Friends can work on the same form together." },
  { text: "Templates can save time when creating forms.", answer: true, why: "A template is a ready-made design you can start from." },
  { text: "Google Forms can be shared by email.", answer: true, why: "You can send your form by email or share a link." },
];

/* ---------- Level 4: game show ---------- */
export type ArenaQuestion =
  | { kind: "mc"; prompt: string; scenario?: string; options: string[]; answer: number; why: string }
  | { kind: "tf"; prompt: string; answer: boolean; why: string }
  | { kind: "match"; prompt: string; pairs: { feature: string; purpose: string }[]; why: string }
  | { kind: "identify"; prompt: string; target: string; why: string };

export const ARENA: ArenaQuestion[] = [
  {
    kind: "mc",
    prompt: "What is the main job of a Google Form?",
    options: ["To play music", "To collect information from people", "To draw pictures", "To print posters"],
    answer: 1,
    why: "Forms collect answers from people in one place.",
  },
  {
    kind: "tf",
    prompt: "Google Forms only works on a computer.",
    answer: false,
    why: "People can also answer on phones and tablets with a web browser.",
  },
  {
    kind: "mc",
    prompt: "Which question should Ms. Lee add to her form?",
    scenario: "Ms. Lee wants to know which field trip students like best.",
    options: ["A video call", "A multiple-choice question", "A paper poster only", "A calculator"],
    answer: 1,
    why: "A multiple-choice question lets students pick one trip from a list.",
  },
  {
    kind: "identify",
    prompt: "Find the button that SHARES your form with others.",
    target: "Send",
    why: "The Send button lets you share your form by email or link.",
  },
  {
    kind: "tf",
    prompt: "Answers are collected automatically in a Google Form.",
    answer: true,
    why: "The form saves every answer for you, so nobody has to copy them.",
  },
  {
    kind: "match",
    prompt: "Match each feature to its purpose.",
    pairs: [
      { feature: "Templates", purpose: "Start with a ready-made design" },
      { feature: "Responses tab", purpose: "See everyone's answers" },
      { feature: "Send button", purpose: "Share your form" },
      { feature: "Rating scale", purpose: "Rate something from 1 to 5" },
    ],
    why: "Each feature has its own special job!",
  },
  {
    kind: "mc",
    prompt: "What should Sam do?",
    scenario: "Sam needs 30 answers fast for a bake sale.",
    options: ["Hide the form in a folder", "Share the form link so everyone can answer", "Print only one copy", "Wait until Friday"],
    answer: 1,
    why: "A shared link lets many people answer on their own devices at the same time.",
  },
  {
    kind: "tf",
    prompt: "You must print a form before people can answer it.",
    answer: false,
    why: "Online forms are answered on a screen, so there is no need to print.",
  },
  {
    kind: "identify",
    prompt: "Find the tab that shows the answers people gave.",
    target: "Responses",
    why: "The Responses tab shows every answer in one place.",
  },
  {
    kind: "tf",
    prompt: "A rating scale lets people choose a number to show how they feel.",
    answer: true,
    why: "Stars or numbers help you measure opinions quickly.",
  },
  {
    kind: "mc",
    prompt: "Which one is a question type you can add to a Google Form?",
    options: ["Multiple choice", "Dance move", "Paint brush", "Robot song"],
    answer: 0,
    why: "Multiple choice is one of the many question types you can use.",
  },
  {
    kind: "mc",
    prompt: "What is a faster way to find the most common answer?",
    scenario: "Mr. Patel has 25 quiz answers on paper.",
    options: ["Count each paper by hand", "Use a Google Form and its Responses summary", "Guess the answer", "Throw the papers away"],
    answer: 1,
    why: "Forms count and summarize answers automatically.",
  },
];

export const FORM_TOOLBAR: { label: string; icon: string }[] = [
  { label: "Send", icon: "📤" },
  { label: "Preview", icon: "👁️" },
  { label: "Responses", icon: "📊" },
  { label: "Settings", icon: "⚙️" },
  { label: "Print", icon: "🖨️" },
  { label: "Delete", icon: "🗑️" },
];

/* ---------- Level 3: RoboLab ---------- */
export const TEMPLATES: { id: string; name: string; emoji: string; blurb: string }[] = [
  { id: "party", name: "Party Invitation", emoji: "🎉", blurb: "Invite friends and see who is coming." },
  { id: "feedback", name: "Event Feedback", emoji: "📋", blurb: "Find out what people thought about an event." },
  { id: "quiz", name: "Class Quiz", emoji: "🧠", blurb: "Test what you know with fun questions." },
  { id: "sports", name: "Sports Day Sign-up", emoji: "🏃", blurb: "Let students sign up for races." },
  { id: "lunch", name: "Lunch Choice Survey", emoji: "🥪", blurb: "Find the most popular lunch." },
  { id: "library", name: "Library Book Request", emoji: "📚", blurb: "Ask for new books for the library." },
];

export const ROBO_ACTIVITIES = ["Robot Racing", "Coding Maze", "Build a Robot", "Robot Dance"];

export interface SampleResponse {
  who: string;
  activity: string;
  rating: number;
}

export const SAMPLE_RESPONSES: SampleResponse[] = [
  { who: "Robo Fan #1", activity: "Robot Racing", rating: 5 },
  { who: "Robo Fan #2", activity: "Robot Racing", rating: 5 },
  { who: "Robo Fan #3", activity: "Coding Maze", rating: 4 },
  { who: "Robo Fan #4", activity: "Build a Robot", rating: 5 },
  { who: "Robo Fan #5", activity: "Robot Racing", rating: 4 },
  { who: "Robo Fan #6", activity: "Robot Dance", rating: 3 },
  { who: "Robo Fan #7", activity: "Coding Maze", rating: 5 },
  { who: "Robo Fan #8", activity: "Build a Robot", rating: 4 },
  { who: "Robo Fan #9", activity: "Robot Racing", rating: 5 },
  { who: "Robo Fan #10", activity: "Build a Robot", rating: 3 },
  { who: "Robo Fan #11", activity: "Coding Maze", rating: 4 },
  { who: "Robo Fan #12", activity: "Robot Racing", rating: 2 },
];

export const NEW_RESPONSES: SampleResponse[] = [
  { who: "Robo Fan #13", activity: "Build a Robot", rating: 5 },
  { who: "Robo Fan #14", activity: "Coding Maze", rating: 5 },
  { who: "Robo Fan #15", activity: "Robot Dance", rating: 4 },
  { who: "Robo Fan #16", activity: "Robot Racing", rating: 4 },
];

/* ---------- Final: classroom checklist ---------- */
export const CLASS_STEPS: { title: string; tip: string }[] = [
  { title: "Visit forms.google.com", tip: "Ask your teacher to open the page with you." },
  { title: "Choose the Event Feedback template", tip: "Look in the template gallery for Event Feedback." },
  { title: "Change the title to RoboChallenge", tip: "Click the title box at the top of the form." },
  { title: "Write a suitable description", tip: "Tell people why their answers matter. Keep it short and friendly." },
  { title: "Add or edit two questions", tip: "Try one multiple-choice question and one rating question." },
  { title: "Preview the form", tip: "Click the Preview (eye) button and test it like a visitor would." },
  { title: "Publish or share it using your teacher's instructions", tip: "Use only the safe classroom sharing method. Never share personal emails." },
  { title: "Review the Responses tab", tip: "Click Responses to see the answers. Look at the charts together." },
];

/* ---------- Reflection ---------- */
export const IDEAS: { id: string; emoji: string; title: string; text: string }[] = [
  { id: "time", emoji: "⏱️", title: "Save time", text: "Forms count the answers for you. No more counting paper by hand!" },
  { id: "organize", emoji: "🗂️", title: "Organize information", text: "Answers are sorted into neat tables and charts automatically." },
  { id: "collect", emoji: "📥", title: "Collect answers easily", text: "Share one link and people can answer from their own devices." },
];
