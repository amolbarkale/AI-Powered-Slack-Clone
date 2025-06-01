Workflow being discussed today:
1. Brainstorm with GPT - reasoning model and create a detailed PRD
2. upload the PRD on claude & gemini and ask it to find scope of hallucinations for a coding agent
3. once point 2 is done let's draft more detailed informations for cursorAI
4. draft details of backend
    framework to be used
    databases to be used
    authentication & authorization mechanism
    third party integrations
    schema design
    api design & documentation
    security meansures
    include all documentation
5. draft details of frontend
    primary & secondary colors
    fonts
    color palette
    spacing system
    UI Patterns
    Icons
    any design Design References
    include all documentation link
5. user journey
    screen 1
    screen 2.. so on
6. rules_to_follow
    don't take decisions on your own
    discuss before assuming
    if multiple approach tell me why you are using one over other
7. execution plan
    using MoSCoW framework make a plan for smallest of the tasks that the agent has to update
    define into multiple phase where each phase has smallest of tasks mentioend
    Choose right model for the task and then get started
8. build phase -> test manually -> test through code -> move to next phase
9. after every phase ask it to update todos & update a document using html + CSS + mermaid for documentation

Steps:

1. I am going to discuss an idea about Slack web application clone with AI integration where basic slack features click chat, channels, doc upload with four AI features like message sentiment, suggest reply, chat summery for the conversation and AI reponse to the question like "What is the progress of project Atlas?" from summaries across channels.

This application will not focus on A to Z slack features BUT core focus will be on following AI integrated features:

What to Build:

A Slack-like chat platform with threads, mentions, and channels.
AI-Powered Killer Add-ons:

Org Brain Plugin:
Give AI access to all public channels + pinned docs, allowing users to ask:

“What’s the latest on Project Atlas?”

AI responds with summaries across channels.
Auto-Reply Composer:
Click “Suggest Reply” on any message thread.
AI proposes responses based on entire thread + org knowledge.
Tone & Impact Meter:
AI highlights if your reply sounds aggressive / weak / confusing, or high-impact / low-impact.
Meeting Notes Generator:
Select a thread or channel → Click “Generate Meeting Notes”.

Now, as you know the application ask me if there is something missing then we need to create a product_requirement_document which will be given to the AI agent. Let me know if you have certain query but we need to be elaborate so that it doesn't leave a scope of hallucinations

2. (After successful brainstoring about backend) Now document the entire backend structure in markdown format so that when giving to codeing agent then there is not scope of hallucination in the backend of the application. THe best practice many people do that Create a frontend flow with markdown and then provide it with our prompt to stich ai.

3. frontend brainstorm: visit google stich ai for creating text to design. Ask GPT for broader view of primary and seconadary colors and color pallets

4. Now lets document to be gven to coding agent draft in markdown format and ensure you are also including the documentation link of all the third party tools that we are using

5. Add above mentioned rules in the expectations.mdc file using markdown format

5. add all above discussed .mdc files to target directory => /cursor/.rules/*.mdc files

6. 
execution plan

    using MoSCoW framework make a plan for smallest of the tasks that the agent has to update

    define into multiple phase where each phase has smallest of tasks mentioend

    Choose right model for the task and then get started

example, 

Phase 1:

1. Set up backend

2.  install third party library

3. Run the backend server

Basically phase broadly divided a task and withing every phase individual tasks to be present which are atomic in nature and such that if the coding agent complete task till last phase then it should be able to build v1 of our application end to end

//_______________start after paid plan____________//

7. Lets start building our phase 1 model in the same order as tasks mentioned in @todo.md

