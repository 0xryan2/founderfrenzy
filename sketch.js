// Global variables
let gameState = "START";        // Tracks current game state: START, STORY, MAIN, PITCH, END
let timer = 60;                 // Total game time in seconds (1 minute)
let valuation = 0;              // Current company valuation, starting at 0
let pitched = false;            // Flags if VC pitch has occurred
let startTime = 0;              // Game start time (milliseconds)
let companyName = "TechVenture"; // Default company name
let productType = "";           // Type of product chosen
let storyProgress = 0;          // Progress through story intro
let currentQuestion = 0;        // Current question index
let playerChoices = [];         // Array to track player's choices
let feedbackMessage = "";       // Feedback message to display
let feedbackTimer = 0;          // Timer for feedback message
let feedbackIsPositive = true;  // Whether the feedback is positive or negative
let valuationChangeDisplay = { amount: 0, timer: 0 }; // For displaying valuation changes
let buttonHover = -1;           // Track which button is being hovered
let founderSkills = {           // Founder skills that affect gameplay
  technical: 1,
  business: 1,
  design: 1,
  marketing: 1
};
let currentEvent = null;        // Current random event
let eventHandled = true;        // Flag to track if current event has been handled

// Color palette
const COLORS = {
  background: [245, 247, 250],  // Light gray-blue background
  primary: [66, 133, 244],      // Google blue
  secondary: [255, 111, 0],     // Vibrant orange
  accent: [52, 168, 83],        // Green
  text: [33, 33, 33],           // Dark gray for text
  lightText: [255, 255, 255],   // White
  button: [66, 133, 244],       // Google blue for buttons
  buttonHover: [25, 103, 210],  // Darker blue for hover
  panel: [255, 255, 255],       // White panels
  shadow: [0, 0, 0, 30]         // Shadow color with alpha
};

// Product types with descriptions
const PRODUCTS = [
  {
    name: "AI Assistant",
    description: "A smart AI assistant that helps users with daily tasks",
    techFocus: true
  },
  {
    name: "Social Platform",
    description: "A new social media platform focused on authentic connections",
    marketingFocus: true
  },
  {
    name: "Productivity Tool",
    description: "A suite of tools to help teams work more efficiently",
    businessFocus: true
  }
];

// Questions and choices that affect the game path
const QUESTIONS = [
  {
    text: "How will you build your initial product?",
    choices: [
      {
        text: "Build it myself - I'm technical",
        impact: { valuation: 50000, skills: { technical: 2 } },
        feedback: "You saved money but it's taking longer to develop."
      },
      {
        text: "Hire developers with my savings",
        impact: { valuation: -50000, skills: { business: 1 } },
        feedback: "You spent money but got a more polished product faster."
      },
      {
        text: "Find a technical co-founder",
        impact: { valuation: 100000, skills: { business: 1 } },
        feedback: "Great move! Your co-founder brings complementary skills."
      }
    ]
  },
  {
    text: "How will you acquire your first users?",
    choices: [
      {
        text: "Social media marketing campaign",
        impact: { valuation: 200000, skills: { marketing: 2 } },
        feedback: "Your campaign brought in early adopters!"
      },
      {
        text: "Cold outreach to potential customers",
        impact: { valuation: 150000, skills: { business: 1, marketing: 1 } },
        feedback: "Your persistence paid off with some key early customers."
      },
      {
        text: "Build in public and leverage Twitter/Reddit",
        impact: { valuation: 100000, skills: { marketing: 1, technical: 1 } },
        feedback: "You're building a following of supporters and early users."
      }
    ]
  },
  {
    text: "A competitor just launched a similar product. What do you do?",
    choices: [
      {
        text: "Focus on a specific niche they're not targeting",
        impact: { valuation: 300000, skills: { business: 2 } },
        feedback: "Smart move! You've found an underserved market segment."
      },
      {
        text: "Add unique features to differentiate your product",
        impact: { valuation: 250000, skills: { technical: 1, design: 1 } },
        feedback: "Your product now stands out with unique capabilities."
      },
      {
        text: "Accelerate your marketing to establish brand first",
        impact: { valuation: 200000, skills: { marketing: 2 } },
        feedback: "You're gaining market recognition, but at a cost."
      }
    ]
  },
  {
    text: "You're running low on cash. What's your next move?",
    choices: [
      {
        text: "Launch a paid version to generate revenue",
        impact: { valuation: 400000, skills: { business: 1 } },
        feedback: "Some users converted to paying customers!"
      },
      {
        text: "Seek angel investment",
        impact: { valuation: 500000, skills: { business: 2 } },
        feedback: "You secured funding but gave up some equity."
      },
      {
        text: "Cut costs and extend runway",
        impact: { valuation: 200000, skills: { business: 1 } },
        feedback: "You're more efficient now but development has slowed."
      }
    ]
  },
  {
    text: "Users are complaining about a key feature. How do you respond?",
    choices: [
      {
        text: "Quickly release a fix and apologize",
        impact: { valuation: 300000, skills: { technical: 1, business: 1 } },
        feedback: "Users appreciate your responsiveness and transparency."
      },
      {
        text: "Schedule a redesign of the feature",
        impact: { valuation: 250000, skills: { design: 2 } },
        feedback: "The redesign will take time but should address root issues."
      },
      {
        text: "Offer premium support to affected users",
        impact: { valuation: 200000, skills: { business: 1, marketing: 1 } },
        feedback: "Some users are placated, but others remain frustrated."
      }
    ]
  },
  {
    text: "A large tech company is interested in acquiring your startup. What's your response?",
    choices: [
      {
        text: "Negotiate for the highest possible price",
        impact: { valuation: 800000, skills: { business: 2 } },
        feedback: "You drove a hard bargain, but the deal might fall through."
      },
      {
        text: "Decline - you want to build something bigger",
        impact: { valuation: 400000, skills: { technical: 1, marketing: 1 } },
        feedback: "Your ambition impressed investors, but it's a risky move."
      },
      {
        text: "Counter with a strategic partnership instead",
        impact: { valuation: 600000, skills: { business: 1, marketing: 1 } },
        feedback: "Smart! You maintain independence while gaining a powerful ally."
      }
    ]
  },
  {
    text: "Your app is experiencing performance issues as user count grows. How do you address this?",
    choices: [
      {
        text: "Optimize your current infrastructure",
        impact: { valuation: 300000, skills: { technical: 2 } },
        feedback: "Good short-term fix, but may limit future growth."
      },
      {
        text: "Rebuild with scalability as the priority",
        impact: { valuation: -100000, skills: { technical: 2, design: 1 } },
        feedback: "Costly now, but you're setting up for massive future growth."
      },
      {
        text: "Hire a specialized DevOps team",
        impact: { valuation: 200000, skills: { business: 1 } },
        feedback: "You've added expertise but increased your burn rate."
      }
    ]
  },
  {
    text: "An influential tech blogger wants to review your product. How do you prepare?",
    choices: [
      {
        text: "Polish the UI/UX for a great first impression",
        impact: { valuation: 350000, skills: { design: 2 } },
        feedback: "The beautiful interface impressed the reviewer!"
      },
      {
        text: "Add some flashy new features just for the demo",
        impact: { valuation: 250000, skills: { technical: 1 } },
        feedback: "The features wowed them, but can you deliver to all users?"
      },
      {
        text: "Focus on your core value proposition",
        impact: { valuation: 450000, skills: { business: 1, marketing: 1 } },
        feedback: "Smart! The reviewer appreciated your focused approach."
      }
    ]
  },
  {
    text: "Your team is experiencing burnout. How do you handle it?",
    choices: [
      {
        text: "Enforce a company-wide vacation week",
        impact: { valuation: -50000, skills: { business: 1 } },
        feedback: "Short-term productivity dropped, but team morale improved."
      },
      {
        text: "Hire more people to distribute the workload",
        impact: { valuation: 150000, skills: { business: 1 } },
        feedback: "Scaling the team helped, but onboarding slowed progress."
      },
      {
        text: "Implement better project management",
        impact: { valuation: 300000, skills: { business: 2 } },
        feedback: "Great move! Efficiency improved without adding costs."
      }
    ]
  },
  {
    text: "A security vulnerability is discovered in your product. What's your response?",
    choices: [
      {
        text: "Immediate patch and transparent disclosure",
        impact: { valuation: 200000, skills: { technical: 1, business: 1 } },
        feedback: "Users appreciated your honesty and quick response."
      },
      {
        text: "Fix it quietly without public announcement",
        impact: { valuation: -200000, skills: { technical: 1 } },
        feedback: "The issue leaked anyway, damaging user trust."
      },
      {
        text: "Hire a security consultant to do a full audit",
        impact: { valuation: 400000, skills: { technical: 2 } },
        feedback: "Excellent! You found and fixed several potential issues."
      }
    ]
  },
  {
    text: "A key employee wants to leave for a competitor. What do you do?",
    choices: [
      {
        text: "Counter-offer with higher compensation",
        impact: { valuation: 100000, skills: { business: 1 } },
        feedback: "They stayed, but your burn rate increased."
      },
      {
        text: "Offer equity and leadership opportunities",
        impact: { valuation: 300000, skills: { business: 2 } },
        feedback: "Great move! They're now more motivated than ever."
      },
      {
        text: "Let them go and restructure the team",
        impact: { valuation: 200000, skills: { business: 1, technical: 1 } },
        feedback: "It was tough initially, but forced beneficial reorganization."
      }
    ]
  },
  {
    text: "You have an opportunity to speak at a major industry conference. How do you prepare?",
    choices: [
      {
        text: "Focus on your product's technical innovation",
        impact: { valuation: 350000, skills: { technical: 2 } },
        feedback: "Tech enthusiasts loved your presentation!"
      },
      {
        text: "Present your vision for the industry's future",
        impact: { valuation: 500000, skills: { marketing: 2 } },
        feedback: "Your visionary talk generated significant buzz!"
      },
      {
        text: "Share concrete user success stories",
        impact: { valuation: 400000, skills: { business: 1, marketing: 1 } },
        feedback: "Potential customers connected with your real-world impact."
      }
    ]
  },
  {
    text: "Your biggest customer is requesting custom features. What's your approach?",
    choices: [
      {
        text: "Build exactly what they want",
        impact: { valuation: 300000, skills: { technical: 1 } },
        feedback: "They're happy, but you're now dependent on one customer."
      },
      {
        text: "Negotiate to build features useful for all users",
        impact: { valuation: 500000, skills: { business: 2, technical: 1 } },
        feedback: "Perfect! You satisfied them while improving your core product."
      },
      {
        text: "Politely decline to avoid feature bloat",
        impact: { valuation: 100000, skills: { business: 1 } },
        feedback: "You maintained focus but risked losing a key customer."
      }
    ]
  },
  {
    text: "A potential investor asks about your exit strategy. What do you say?",
    choices: [
      {
        text: "IPO within 5 years",
        impact: { valuation: 600000, skills: { business: 1 } },
        feedback: "Bold! They're excited by your ambition but skeptical."
      },
      {
        text: "Acquisition by a major player",
        impact: { valuation: 400000, skills: { business: 1 } },
        feedback: "A safe answer that aligned with their expectations."
      },
      {
        text: "Building a sustainable business for the long term",
        impact: { valuation: 300000, skills: { business: 2 } },
        feedback: "Some investors appreciated your commitment to sustainability."
      }
    ]
  },
  {
    text: "Your product has hit a growth plateau. How do you reignite growth?",
    choices: [
      {
        text: "Expand to a new market segment",
        impact: { valuation: 500000, skills: { marketing: 1, business: 1 } },
        feedback: "Smart pivot! You've found untapped potential."
      },
      {
        text: "Launch a major new feature",
        impact: { valuation: 400000, skills: { technical: 2 } },
        feedback: "The feature generated renewed interest in your product."
      },
      {
        text: "Aggressive marketing campaign",
        impact: { valuation: 300000, skills: { marketing: 2 } },
        feedback: "You gained users but at a high acquisition cost."
      }
    ]
  }
];

// Pitch options with more depth
const PITCHES = [
  {
    title: "Growth Metrics",
    description: "Showcase your impressive user growth and engagement",
    impact: 1000000,
    skillBonus: "marketing"
  },
  {
    title: "Technical Innovation",
    description: "Highlight your unique technical advantages",
    impact: 800000,
    skillBonus: "technical"
  },
  {
    title: "Business Model",
    description: "Present your path to profitability",
    impact: 900000,
    skillBonus: "business"
  },
  {
    title: "User Experience",
    description: "Demonstrate your exceptional design and usability",
    impact: 700000,
    skillBonus: "design"
  }
];

// Random events that can occur
const EVENTS = [
  {
    text: "A tech blog featured your startup!",
    impact: 300000,
    skillBonus: "marketing"
  },
  {
    text: "A key team member is considering leaving.",
    impact: -200000,
    skillBonus: "business"
  },
  {
    text: "Users love your latest feature update!",
    impact: 250000,
    skillBonus: "technical"
  },
  {
    text: "A potential partner wants to integrate with your product.",
    impact: 400000,
    skillBonus: "business"
  },
  {
    text: "Your server costs have unexpectedly doubled.",
    impact: -150000,
    skillBonus: "technical"
  },
  {
    text: "A major competitor has launched a direct copy of your product.",
    impact: -500000,
    skillBonus: "marketing"
  },
  {
    text: "Your app was featured in the App Store!",
    impact: 600000,
    skillBonus: "design"
  },
  {
    text: "A critical security breach was discovered in your system.",
    impact: -800000,
    skillBonus: "technical"
  },
  {
    text: "An influential investor publicly praised your business model.",
    impact: 700000,
    skillBonus: "business"
  },
  {
    text: "Your main database crashed, causing data loss for some users.",
    impact: -600000,
    skillBonus: "technical"
  },
  {
    text: "A viral social media post about your product is gaining traction!",
    impact: 500000,
    skillBonus: "marketing"
  },
  {
    text: "Your product was mentioned in a negative news article.",
    impact: -400000,
    skillBonus: "marketing"
  }
];

// Format number with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Helper function to wrap text
function wrapText(text, x, y, maxWidth, lineHeight) {
  let words = text.split(' ');
  let line = '';
  let testLine = '';
  let lineCount = 0;
  
  for(let n = 0; n < words.length; n++) {
    testLine = line + words[n] + ' ';
    let testWidth = textWidth(testLine);
    
    if (testWidth > maxWidth && n > 0) {
      fill(COLORS.text);
      text(line, x, y + (lineCount * lineHeight));
      line = words[n] + ' ';
      lineCount++;
    }
    else {
      line = testLine;
    }
  }
  
  fill(COLORS.text);
  text(line, x, y + (lineCount * lineHeight));
  
  return lineCount + 1; // Return the number of lines used
}

// Setup function: initializes canvas and frame rate
function setup() {
  let canvas = createCanvas(800, 600);       // Canvas size: 800px wide, 600px tall
  canvas.parent('game-container');           // Place canvas in the game-container element
  frameRate(60);                // 60 frames per second for smooth animation
  textAlign(CENTER, CENTER);    // Center text alignment
  rectMode(CENTER);             // Center rectangle drawing mode
}

// Draw function: main game loop, runs every frame
function draw() {
  background(COLORS.background);  // Set background color
  
  // Handle different game states
  switch(gameState) {
    case "START":
      drawStartScreen();
      break;
    case "STORY":
      drawStoryScreen();
      break;
    case "MAIN":
      drawMainGameScreen();
      break;
    case "PITCH":
      drawPitchScreen();
      break;
    case "END":
      drawEndScreen();
      break;
  }
  
  // Draw feedback message if active
  if (millis() < feedbackTimer) {
    drawFeedbackMessage();
  }
  
  // Draw valuation change if active
  if (millis() < valuationChangeDisplay.timer) {
    drawValuationChange();
  }
}

// Mouse pressed function: handles all player clicks
function mousePressed() {
  switch(gameState) {
    case "START":
      handleStartScreenClick();
      break;
    case "STORY":
      handleStoryScreenClick();
      break;
    case "MAIN":
      handleMainGameClick();
      break;
    case "PITCH":
      handlePitchScreenClick();
      break;
    case "END":
      // Restart game if clicked at end
      if (isMouseInRect(width/2, height - 100, 200, 50)) {
        resetGame();
      }
      break;
  }
}

function mouseMoved() {
  // Update button hover state
  buttonHover = -1;
  
  // Check different buttons based on game state
  if (gameState === "START") {
    // Check product selection buttons
    for (let i = 0; i < PRODUCTS.length; i++) {
      if (isMouseInRect(width/2, 300 + i*70, 300, 50)) {
        buttonHover = i;
        return;
      }
    }
  } else if (gameState === "MAIN") {
    // Check question choice buttons
    if (currentQuestion < QUESTIONS.length && eventHandled) {
      let question = QUESTIONS[currentQuestion];
      for (let i = 0; i < question.choices.length; i++) {
        if (isMouseInRect(width/2, 300 + i*70, 500, 50)) {
          buttonHover = i;
          return;
        }
      }
    } else if (!eventHandled) {
      // Check event continue button
      if (isMouseInRect(width/2, 300, 200, 50)) {
        buttonHover = 0;
        return;
      }
    }
  } else if (gameState === "PITCH") {
    // Check pitch option buttons
    for (let i = 0; i < PITCHES.length; i++) {
      if (isMouseInRect(width/2, 250 + i*70, 500, 50)) {
        buttonHover = i;
        return;
      }
    }
  }
}

// Helper function to check if mouse is in a rectangle
function isMouseInRect(x, y, w, h) {
  return mouseX > x - w/2 && mouseX < x + w/2 && 
         mouseY > y - h/2 && mouseY < y + h/2;
}

// Draw start screen: product selection
function drawStartScreen() {
  // Title with subtle gradient effect
  fill(COLORS.primary);
  textSize(40);
  text("FOUNDER FRENZY", width/2, 100);
  
  // Subtitle
  fill(COLORS.text);
  textSize(24);
  text("Start Your Startup Journey", width/2, 150);
  
  // Product selection
  textSize(20);
  text("Choose your product:", width/2, 220);
  
  for (let i = 0; i < PRODUCTS.length; i++) {
    let product = PRODUCTS[i];
    let y = 300 + i * 70;
    
    // Draw button with modern style
    drawButton(width/2, y, 300, 50, buttonHover === i);
    
    // Draw text
    fill(COLORS.lightText);
    textSize(16);
    text(product.name, width/2, y - 10);
    textSize(12);
    text(product.description, width/2, y + 10);
  }
  
  // Instructions
  fill(COLORS.text);
  textSize(14);
  text("Build your startup from idea to funding pitch in this fast-paced simulation!", width/2, height - 50);
}

// Handle clicks on the start screen
function handleStartScreenClick() {
  // Product selection
  for (let i = 0; i < PRODUCTS.length; i++) {
    if (isMouseInRect(width/2, 300 + i*70, 300, 50)) {
      productType = PRODUCTS[i].name;
      
      // Adjust initial skills based on product type
      if (PRODUCTS[i].techFocus) founderSkills.technical += 1;
      if (PRODUCTS[i].marketingFocus) founderSkills.marketing += 1;
      if (PRODUCTS[i].businessFocus) founderSkills.business += 1;
      
      // Move to story intro
      gameState = "STORY";
      return;
    }
  }
}

// Draw the story introduction screen
function drawStoryScreen() {
  // Modern panel with shadow
  drawPanel(width/2, height/2, 600, 400);
  
  fill(COLORS.primary);
  textSize(28);
  text("Your Startup Story", width/2, 150);
  
  fill(COLORS.text);
  textSize(18);
  
  // Different story stages
  switch(storyProgress) {
    case 0:
      text("You've just founded " + companyName + ",", width/2, 220);
      text("a promising new " + productType + " startup.", width/2, 250);
      text("With big dreams and limited resources,", width/2, 280);
      text("you're ready to take on the tech world.", width/2, 310);
      break;
    case 1:
      text("You have 1 minute to grow your company", width/2, 220);
      text("from zero to a successful funding pitch.", width/2, 250);
      text("Make smart decisions, respond to challenges,", width/2, 280);
      text("and build your company valuation.", width/2, 310);
      break;
    case 2:
      text("Your goal: reach a $10 million valuation", width/2, 220);
      text("to impress venture capitalists.", width/2, 250);
      text("Your skills and choices will determine", width/2, 280);
      text("if you can make it in the startup world.", width/2, 310);
      break;
  }
  
  // Continue button
  drawButton(width/2, height - 150, 200, 50, false);
  fill(COLORS.lightText);
  textSize(18);
  text(storyProgress < 2 ? "Continue" : "Start Building", width/2, height - 150);
}

// Handle clicks on the story screen
function handleStoryScreenClick() {
  if (isMouseInRect(width/2, height - 150, 200, 50)) {
    if (storyProgress < 2) {
      storyProgress++;
    } else {
      // Start the main game
      gameState = "MAIN";
      startTime = millis();
    }
  }
}

// Draw the main game screen
function drawMainGameScreen() {
  // Draw office background
  drawOfficeBackground();
  
  // Draw UI elements
  drawGameUI();
  
  // Draw current question if available and no event is active
  if (currentQuestion < QUESTIONS.length && eventHandled) {
    drawCurrentQuestion();
  } else if (!eventHandled) {
    // Draw the current event
    drawEvent();
  } else if (eventHandled && currentQuestion >= QUESTIONS.length) {
    // If we've gone through all questions and no event is active,
    // reset the question index and shuffle questions
    currentQuestion = 0;
    QUESTIONS.sort(() => random(-1, 1));
  }
  
  // Check if time to move to pitch phase
  let elapsed = (millis() - startTime) / 1000;
  if (elapsed >= 45 && !pitched) {  // At 0:45 (45 seconds)
    gameState = "PITCH";
    pitched = true;
  } else if (elapsed >= timer) {     // At 1:00 (60 seconds)
    gameState = "END";
  }
}

// Draw the office background
function drawOfficeBackground() {
  // Modern office background
  fill(220, 220, 220);  // Light gray walls
  rect(width/2, height/2, width, height);
  
  // Window
  fill(173, 216, 230);  // Light blue sky
  rect(700, 200, 150, 200);
  stroke(100);
  line(700, 100, 700, 300);
  line(625, 200, 775, 200);
  noStroke();
  
  // Desk
  fill(160, 82, 45);  // Brown desk
  rect(width/2, 450, 600, 20);
  
  // Computer
  fill(50);  // Dark monitor
  rect(width/2, 380, 120, 80);
  fill(80);  // Monitor stand
  rect(width/2, 425, 20, 30);
  
  // Coffee cup
  fill(139, 69, 19);  // Brown cup
  rect(600, 430, 20, 30);
  
  // Plant
  fill(34, 139, 34);  // Green plant
  ellipse(200, 400, 40, 40);
  fill(139, 69, 19);  // Brown pot
  rect(200, 430, 30, 30);
}

// Draw the game UI elements
function drawGameUI() {
  // Top panel with shadow and rounded corners
  drawPanel(width/2, 40, width - 20, 60);
  
  // Company info
  fill(COLORS.text);
  textAlign(LEFT, CENTER);
  textSize(16);
  text(companyName + " - " + productType, 20, 40);
  
  // Timer
  let elapsed = floor((millis() - startTime) / 1000);
  let timeLeft = max(0, timer - elapsed);
  textAlign(CENTER, CENTER);
  text("Time: " + floor(timeLeft / 60) + ":" + nf(timeLeft % 60, 2), width/2, 40);
  
  // Valuation
  textAlign(RIGHT, CENTER);
  text("Valuation: $" + formatNumber(valuation), width - 20, 40);
  
  // Reset text alignment
  textAlign(CENTER, CENTER);
}

// Draw the current question and choices
function drawCurrentQuestion() {
  if (currentQuestion >= QUESTIONS.length) return;
  
  let question = QUESTIONS[currentQuestion];
  
  // Question panel with shadow and rounded corners - make it taller
  drawPanel(width/2, 170, 600, 100);
  
  // Question text with wrapping
  fill(COLORS.text);
  textSize(18);
  textAlign(CENTER, TOP);
  wrapText(question.text, width/2, 140, 550, 25);
  textAlign(CENTER, CENTER);
  
  // Choices
  for (let i = 0; i < question.choices.length; i++) {
    let choice = question.choices[i];
    let y = 300 + i * 80; // Increase vertical spacing
    
    // Choice button with shadow and rounded corners - make it taller
    drawButton(width/2, y, 500, 60, buttonHover === i);
    
    // Choice text with wrapping
    fill(COLORS.lightText);
    textSize(16);
    textAlign(CENTER, CENTER);
    wrapText(choice.text, width/2, y - 10, 450, 20);
  }
}

// Helper function to draw a modern panel with shadow and rounded corners
function drawPanel(x, y, w, h) {
  // Draw shadow
  noStroke();
  fill(COLORS.shadow);
  rect(x + 3, y + 3, w, h, 10);
  
  // Draw panel
  fill(COLORS.panel);
  rect(x, y, w, h, 10);
}

// Helper function to draw a modern button with shadow and rounded corners
function drawButton(x, y, w, h, isHovered) {
  // Draw shadow
  noStroke();
  fill(COLORS.shadow);
  rect(x + 2, y + 2, w, h, 10);
  
  // Draw button
  fill(isHovered ? COLORS.buttonHover : COLORS.button);
  rect(x, y, w, h, 10);
}

// Handle clicks in the main game
function handleMainGameClick() {
  if (currentQuestion < QUESTIONS.length && eventHandled) {
    let question = QUESTIONS[currentQuestion];
    
    // Check if a choice was clicked
    for (let i = 0; i < question.choices.length; i++) {
      if (isMouseInRect(width/2, 300 + i*80, 500, 60)) { // Updated coordinates to match new button size
        let choice = question.choices[i];
        
        // Add luck factor - 20% chance of a different outcome
        let luckyRoll = random(1);
        let luckMessage = "";
        let actualImpact = choice.impact.valuation;
        
        if (luckyRoll < 0.1) {
          // 10% chance of a much better outcome
          actualImpact = choice.impact.valuation * 2;
          luckMessage = "Lucky break! The outcome was better than expected. ";
        } else if (luckyRoll < 0.2) {
          // 10% chance of a much worse outcome
          actualImpact = choice.impact.valuation / 2;
          luckMessage = "Unlucky! Things didn't go as planned. ";
        }
        
        // Apply choice impact with luck factor
        valuation += actualImpact;
        
        // Show valuation change
        showValuationChange(actualImpact);
        
        // Apply skill changes
        if (choice.impact.skills) {
          for (let skill in choice.impact.skills) {
            founderSkills[skill] += choice.impact.skills[skill];
            // Cap skills at 5
            founderSkills[skill] = min(founderSkills[skill], 5);
          }
        }
        
        // Record choice
        playerChoices.push(i);
        
        // Show feedback with luck message
        showFeedback(luckMessage + choice.feedback, actualImpact >= 0);
        
        // Move to next question
        currentQuestion++;
        
        // Check if we've gone through all questions
        if (currentQuestion >= QUESTIONS.length) {
          // 30% chance of triggering a random event, otherwise reset questions
          if (random(1) < 0.3) {
            currentEvent = random(EVENTS);
            eventHandled = false;
          } else {
            // Reset to questions
            currentQuestion = 0;
            // Shuffle questions for variety
            QUESTIONS.sort(() => random(-1, 1));
          }
        }
        
        return;
      }
    }
  } else if (!eventHandled) {
    // Handle event continue button
    if (isMouseInRect(width/2, 300, 200, 50)) {
      // Apply event impact with skill bonus
      let skillBonus = 1;
      if (currentEvent.skillBonus && founderSkills[currentEvent.skillBonus] > 1) {
        skillBonus = founderSkills[currentEvent.skillBonus] / 2;
      }
      
      // Add luck factor to events too - 20% chance of different outcome
      let luckyRoll = random(1);
      let actualImpact = currentEvent.impact * skillBonus;
      let luckMessage = "";
      
      if (luckyRoll < 0.1) {
        // 10% chance of a much better outcome
        actualImpact = actualImpact * 1.5;
        luckMessage = "A stroke of luck made this even better!";
      } else if (luckyRoll < 0.2) {
        // 10% chance of a much worse outcome
        actualImpact = actualImpact * 0.5;
        luckMessage = "Bad luck made this worse than expected.";
      }
      
      valuation += actualImpact;
      
      // Show valuation change
      showValuationChange(actualImpact);
      
      // Show feedback
      showFeedback(luckMessage, actualImpact >= 0);
      
      // Reset for next question cycle
      currentQuestion = 0;
      eventHandled = true;
      
      // Shuffle questions for variety
      QUESTIONS.sort(() => random(-1, 1));
      
      return;
    }
  }
}

// Draw the current event
function drawEvent() {
  if (!currentEvent) return;
  
  // Event panel with shadow and rounded corners - make it taller
  drawPanel(width/2, 170, 600, 100);
  
  // Event text with wrapping
  fill(COLORS.text);
  textSize(18);
  textAlign(CENTER, TOP);
  wrapText(currentEvent.text, width/2, 140, 550, 25);
  textAlign(CENTER, CENTER);
  
  // Apply skill bonus if player has points in that skill
  let skillBonus = 1;
  if (currentEvent.skillBonus && founderSkills[currentEvent.skillBonus] > 1) {
    skillBonus = founderSkills[currentEvent.skillBonus] / 2;
  }
  
  // Calculate impact with skill bonus
  let actualImpact = currentEvent.impact * skillBonus;
  
  // Show impact
  let impactText = actualImpact >= 0 ? "+" : "";
  impactText += "$" + formatNumber(actualImpact);
  
  textSize(24);
  fill(actualImpact >= 0 ? COLORS.accent : color(255, 0, 0));
  text(impactText, width/2, 220);
  
  // Continue button
  drawButton(width/2, 300, 200, 50, buttonHover === 0);
  fill(COLORS.lightText);
  textSize(18);
  text("Continue", width/2, 300);
}

// Draw the pitch screen
function drawPitchScreen() {
  // Office background with VC meeting room feel
  fill(240, 240, 240);
  rect(width/2, height/2, width, height);
  
  // Presentation screen - modern panel
  drawPanel(width/2, 150, 500, 150);
  
  // Title
  fill(COLORS.primary);
  textSize(32);
  text("Pitch to Investors", width/2, 100);
  
  fill(COLORS.text);
  textSize(18);
  text("Your " + productType + " has reached a critical point.", width/2, 140);
  text("Choose your pitch focus to maximize your valuation:", width/2, 170);
  
  // Pitch options
  for (let i = 0; i < PITCHES.length; i++) {
    let pitch = PITCHES[i];
    let y = 250 + i * 70;
    
    // Pitch button with modern style
    drawButton(width/2, y, 500, 50, buttonHover === i);
    
    // Calculate bonus based on skills
    let bonus = founderSkills[pitch.skillBonus] > 1 ? 
                founderSkills[pitch.skillBonus] * 100000 : 0;
    
    // Pitch text
    fill(COLORS.lightText);
    textSize(16);
    text(pitch.title + " - " + pitch.description, width/2, y - 10);
    textSize(14);
    text("Base: $" + formatNumber(pitch.impact) + 
         (bonus > 0 ? " + Skill Bonus: $" + formatNumber(bonus) : ""), 
         width/2, y + 10);
  }
}

// Handle clicks on the pitch screen
function handlePitchScreenClick() {
  for (let i = 0; i < PITCHES.length; i++) {
    if (isMouseInRect(width/2, 250 + i*70, 500, 50)) {
      let pitch = PITCHES[i];
      
      // Calculate bonus based on skills
      let bonus = founderSkills[pitch.skillBonus] > 1 ? 
                  founderSkills[pitch.skillBonus] * 100000 : 0;
      
      // Add luck factor - 20% chance of a different outcome
      let luckyRoll = random(1);
      let luckMessage = "";
      let actualImpact = pitch.impact + bonus;
      
      if (luckyRoll < 0.1) {
        // 10% chance of a much better outcome
        actualImpact = actualImpact * 1.5;
        luckMessage = "The investors were extremely impressed! ";
      } else if (luckyRoll < 0.2) {
        // 10% chance of a much worse outcome
        actualImpact = actualImpact * 0.6;
        luckMessage = "The investors seemed skeptical. ";
      }
      
      // Apply pitch impact with luck factor
      valuation += actualImpact;
      
      // Show valuation change
      showValuationChange(actualImpact);
      
      // Show feedback with luck message
      showFeedback(luckMessage + "You pitched " + pitch.title + " to the investors!", actualImpact >= 0);
      
      // Move to end screen
      gameState = "END";
      return;
    }
  }
}

// Draw the end screen
function drawEndScreen() {
  // Background panel with shadow
  drawPanel(width/2, height/2, 600, 400);
  
  // Title
  let success = valuation >= 10000000;
  
  if (success) {
    fill(COLORS.accent);
    textSize(32);
    text("CONGRATULATIONS!", width/2, 150);
    fill(COLORS.text);
    textSize(24);
    text("You secured the funding!", width/2, 200);
  } else {
    fill(COLORS.secondary);
    textSize(32);
    text("GAME OVER", width/2, 150);
    fill(COLORS.text);
    textSize(24);
    text("The VCs passed on your pitch.", width/2, 200);
  }
  
  // Final valuation
  fill(COLORS.text);
  textSize(20);
  text("Final Valuation: $" + formatNumber(valuation), width/2, 250);
  
  // Goal
  text("Goal: $10,000,000", width/2, 280);
  
  // Success percentage
  let percentage = min(100, floor(valuation / 100000));
  text("Success Rate: " + percentage + "%", width/2, 310);
  
  // Skills summary
  textSize(16);
  text("Final Skills:", width/2, 350);
  
  let skillX = 250;
  let skills = Object.entries(founderSkills);
  for (let [skill, level] of skills) {
    text(skill.charAt(0).toUpperCase() + skill.slice(1) + ": " + level, skillX, 380);
    skillX += 100;
  }
  
  // Play again button with modern style
  drawButton(width/2, height - 100, 200, 50, false);
  fill(COLORS.lightText);
  textSize(18);
  text("Play Again", width/2, height - 100);
}

// Show feedback message
function showFeedback(message, isPositive) {
  feedbackMessage = message;
  feedbackTimer = millis() + 3000; // Show for 3 seconds
  feedbackIsPositive = isPositive;
}

// Show valuation change
function showValuationChange(amount) {
  valuationChangeDisplay.amount = amount;
  valuationChangeDisplay.timer = millis() + 2000; // Show for 2 seconds
}

// Draw feedback message
function drawFeedbackMessage() {
  // Semi-transparent panel with rounded corners
  noStroke();
  
  // Change color based on whether feedback is positive or negative
  if (feedbackIsPositive) {
    fill(52, 168, 83, 180); // Green with alpha
  } else {
    fill(234, 67, 53, 180); // Red with alpha
  }
  
  rect(width/2, height - 50, width, 60, 10);
  
  fill(255);
  textSize(16);
  text(feedbackMessage, width/2, height - 50);
}

// Draw valuation change
function drawValuationChange() {
  let amount = valuationChangeDisplay.amount;
  let alpha = map(valuationChangeDisplay.timer - millis(), 0, 2000, 0, 255);
  
  textAlign(RIGHT, CENTER);
  textSize(24);
  
  if (amount >= 0) {
    fill(52, 168, 83, alpha); // Green with fading alpha
    text("+" + formatNumber(amount), width - 50, 80);
  } else {
    fill(234, 67, 53, alpha); // Red with fading alpha
    text(formatNumber(amount), width - 50, 80);
  }
  
  textAlign(CENTER, CENTER);
}

// Reset game to start over
function resetGame() {
  gameState = "START";
  valuation = 0;
  pitched = false;
  startTime = 0;
  productType = "";
  storyProgress = 0;
  currentQuestion = 0;
  playerChoices = [];
  feedbackMessage = "";
  feedbackTimer = 0;
  eventHandled = true;
  currentEvent = null;
  founderSkills = {
    technical: 1,
    business: 1,
    design: 1,
    marketing: 1
  };
}