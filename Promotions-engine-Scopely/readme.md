# My Journey Building the Promotion Rule Engine for Scopely Casino

##  My First Thoughts

When I opened the Scopely Casino internship assignment document, I felt this mix of excitement and "oh wow, this is real." The task was clear but challenging: build a **Promotion Rule Engine Microservice** in just one day that intelligently selects in-game promotions for casino players based on business rules.

Staring at the requirements, my first big decision hit me immediately: **Java, Python, or Node.js?** Having worked primarily with the MERN stack, I went with **Node.js and Express** because:
- I could move fast without fighting new syntax under a tight deadline
- I knew I could focus on the actual business logic instead of learning a new framework
- Node.js felt perfect for this type of I/O-heavy microservice
- Honestly, I wanted to play to my strengths given the time pressure

##  How I worked towards this project

### 1: Planning & Getting My Head Around It (30 minutes)
I opened a post it on my system broke down what I actually needed to build:
- A **POST /promotion** endpoint that takes player data and spits out the right promotion
- **YAML-based rules** so the business team could update promotions without bothering developers
- **Hot-reload functionality** because nobody wants to restart servers in production
- **Smart rule evaluation** with priorities (VIP customers should get better offers, obviously)

I sketched out a simple architecture:
```
src/
├── server.js          # Main Express server
├── ruleEngine.js      # The brain of the whole thing
├── routes/            # All my API endpoints
├── middleware/        # Input validation stuff
└── metrics.js         # Monitoring (felt very professional!)
```

### 2: Actually Building (3-4 hours)

**Starting with the Rule Engine:**
I decided to build the core logic first. My approach was straightforward:
1. Store everything in a `rules.yml` file (easy to read and edit)
2. Sort rules by priority - higher priority rules get checked first
3. Support different condition types (min/max values, lists, exact matches, etc.)

**Building the REST API:**
I used Joi for validation (learned about it through youtube) and structured responses to be really clear:
```javascript
{
  "success": true,
  "player_id": "player123", 
  "selected_promotion": { /* the actual promotion */ },
  "matched_rule": { /* which rule triggered it */ },
  "selection_time_ms": 2
}
```

**Adding Some Production Polish:**
I threw in Prometheus metrics because it seemed like something a real microservice should have. Tracking things like:
- How many requests we're getting
- Which rules are matching most often
- How fast everything is running

##  The Bug That Almost Broke My Brain

### What Happened
So I'm running my tests, feeling pretty good about myself, and then BAM:
```
Expected: "default_promotion"
Received: "new_player_boost"
```

I stared at this for like 20 minutes thinking "my rule engine is completely broken." The test was called "should select default promotion when no rules match" but it kept selecting the new player boost. What the heck?

### The Investigation 
I started going through my test data line by line:
```javascript
const newPlayer = {
  player_id: 'new123',
  player_level: 1,           // Wait a minute...
  spend_tier: 'BRONZE',
  country: 'XX',
  days_since_last_purchase: 0,
  days_since_registration: 1, // Hmm...
  total_spend_30d: 0
}
```

Then it clicked. This player I created for the "no rules match" test was actually a **perfect match** for the new player boost rule:
- Level 1 is definitely ≤ 10 ✅
- 1 day since registration is ≤ 7 ✅

My rule engine wasn't broken at all!

### The Fix and What I Learned
The issue was that I didn't understand my own system properly. Since rules are evaluated by priority:
1. `new_player_boost` (priority 60) gets checked first
2. My test player matched perfectly, so it returned that promotion
3. The `default_promotion` (priority 1) never even got evaluated

I fixed it by creating a player that truly doesn't match anything:
```javascript
const noMatchPlayer = {
  player_id: 'nomatch123',
  player_level: 15,          // Too high for new player boost
  days_since_registration: 30, // Too old for new player boost
  country: 'ZZ',             // Not in any special country lists
  spend_tier: 'BRONZE',      // Doesn't qualify for VIP stuff
  total_spend_30d: 50        // Not enough for big spender rules
}
```

This bug taught me so much:
- **Test your assumptions** - just because you name a test something doesn't mean it does what you think
- **Understand your own logic** - priority systems have behavior that isn't always obvious
- **Real-world data is messy** - casino players will have all kinds of weird combinations

##  Testing: Terminal Tests + Postman

### Running Unit Tests
I wrote comprehensive Jest tests covering all the scenarios:

```bash
npm test
```

Results that made me feel pretty good:
```
✓ should select high spender VIP promotion (9 ms)
✓ should select comeback special for inactive player (1 ms)  
✓ should select new-player boost for eligible new players (2 ms)
✓ should reload rules successfully (12 ms)
✓ should select default promotion when absolutely no rules match (1 ms)

Tests: 5 passed, 5 total
Time: 1.475s
```

Those fast response times (1-12ms) told me the system could handle real casino traffic.

### Testing with Postman
I created a whole collection in Postman to test everything:

**Health Check:**
- `GET http://localhost:8085/health` 
- Made sure the service was actually running

**The Main Event - Promotion Selection:**  
- `POST http://localhost:8085/api/v1/promotions/promotion`
- Tested with different player profiles:
  - High-spending player → Got the VIP Mega Bonus (1M chips!)
  - Brand new player → Got the New Player Boost (100K chips)
  - Player who hasn't spent in weeks → Got the Welcome Back offer
  - Random player who didn't match anything special → Got the daily bonus

**Other Endpoints I Built:**
- `POST http://localhost:8085/api/v1/promotions/reload-rules` - Hot reload worked perfectly
- `GET http://localhost:8085/metrics` - Saw all the Prometheus metrics
- `GET http://localhost:8085/api/v1/promotions/rules/stats` - Nice overview of all active rules

Every single request in Postman came back in under a millisecond. I was honestly pretty amazed at how fast it was.

##  How GitHub Copilot Helped Me Code Faster

### The Good Stuff
I had the GitHub Copilot extension running in VS Code, and it was genuinely helpful:
- **Boilerplate code**: It wrote a lot of the Express setup and middleware for me
- **Test structures**: Suggested test patterns that I tweaked for my needs
- **Error handling**: Reminded me to add try-catch blocks in places I might have forgotten
- **Import suggestions**: Saved me from typos in module names

### The Reality Check
But honestly, Copilot couldn't help with the hard stuff:
- Understanding what promotions actually make sense for casino players
- Figuring out the priority system logic
- Debugging that tricky test issue
- Making architectural decisions about YAML vs database storage

It's a great productivity tool, but I still had to do all the thinking.

##  Why I Made the Choices I Did

### Node.js vs Java vs Python
**My Choice**: Node.js + Express
**Why**: 
- I could move fastest with JavaScript
- Perfect for this kind of request-response API  
- Smaller memory footprint for a simple microservice
- The async nature fits well for I/O operations

**Trade-offs**: 
- Java might be more "enterprise-y" for a big company
- Python could have been good for rule logic, but I'm stronger in JS

### YAML File vs Database
**My Choice**: In-memory YAML rule storage
**Why**:
- Lightning fast - rules load into memory at startup
- Business people can actually read and edit YAML
- Easy to version control rule changes
- No database setup complexity for a 1-day assignment

### Simple Priority System vs Complex Rule Engine
**My Choice**: Priority + basic conditions
**Why**:
- Easy for business teams to understand
- Predictable behavior when debugging
- Fast evaluation for gaming applications
- I could actually build it in one day!

**Trade-offs**:
- Less flexible than something like Drools
- Requires careful priority management as rules grow

##  What I Actually Delivered

At the end of the DAY(end of the night), I had:
- ✅ A working REST API with all required endpoints
- ✅ 100% passing unit tests
- ✅ Hot-reload capability for business agility  
- ✅ Production-ready monitoring with Prometheus
- ✅ Response times under 1ms (perfect for gaming)
- ✅ Clear documentation and examples
- ✅ Validation that prevents bad input data

##  What I Learned About Myself

### Technical Growth
- Got much better at thinking through business requirements systematically
- Learned to build with monitoring in mind from the start
- Improved my testing approach 
- Became more confident with production API patterns

### Problem-Solving
- Slowing down to really understand a problem before jumping to solutions
- The importance of testing your test logic, not just your code
- How to use AI tools effectively without becoming dependent on them

### Professional Mindset  
- Thinking about who will actually use and maintain this code
- Considering operational needs (monitoring, configuration management)
- Understanding that good software solves business problems, not just technical ones

##  If I Had More Time

With another day or two, I would have added:
- A simple web UI for business users to edit rules visually
- More sophisticated rule conditions (date ranges, user segments)
- Caching layer for even better performance
- More detailed logging for troubleshooting in production

## 💭 Final Thoughts

This assignment pushed me harder than most of my coursework. The one-day deadline meant I had to make decisions quickly and trust my instincts. The debugging experience with the test failure was actually the most valuable part - it taught me that sometimes the "bug" is in your understanding, not your code.

I'm genuinely proud of what I built. It's not just a working API, it's something that could actually run in production and handle real casino traffic. That feels pretty awesome.

Most importantly, I learned that building good software isn't just about writing code that works - it's about understanding the business problem, making thoughtful trade-offs, and creating something that real people can actually use and maintain.

I'm excited to bring this systematic thinking and growth mindset to the Scopely team, where I can keep learning while building great gaming experiences.

---

## 🚀 How to Run the Project

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Start production server
npm start
```

**Server will be running at:** `http://localhost:8085`

**Available Endpoints:**
- Health Check: `GET /health`
- Select Promotion: `POST /api/v1/promotions/promotion`  
- Reload Rules: `POST /api/v1/promotions/reload-rules`
- View Metrics: `GET /metrics`
- Rule Stats: `GET /api/v1/promotions/rules/stats`

**Example Request in Postman:**
```json
POST http://localhost:8085/api/v1/promotions/promotion
Content-Type: application/json

{
  "player_id": "player123",
  "player_level": 55,
  "spend_tier": "GOLD",
  "country": "US",
  "days_since_last_purchase": 20,
  "total_spend_30d": 1500
}
```