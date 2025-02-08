from langchain.chains.summarize import load_summarize_chain
from langchain.docstore.document import Document
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.text_splitter import CharacterTextSplitter
import os
import openai
from dotenv import load_dotenv, find_dotenv

def minutes_meet(text):

    # Load environment variables
    _ = load_dotenv(find_dotenv())

    openai_api_key = os.getenv('OPENAI_API_KEY')
    if not openai_api_key:
        # Fallback API key if none is available
        openai_api_key = ""
        os.environ['OPENAI_API_KEY'] = openai_api_key

    target_len = 500
    chunk_size = 3000
    chunk_overlap = 200

    # Split the input text into chunks
    text_splitter = CharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
    )
    texts = text_splitter.split_text(text)
    docs = [Document(page_content=t) for t in texts]

    # Initialize the ChatOpenAI model
    llm = ChatOpenAI(
        temperature=0, 
        model="gpt-4o-mini", 
        api_key=openai_api_key
    )

    # Main prompt for summarizing
    prompt_template = """Act as a professional technical meeting minutes writer. 
Tone: formal
Format: Technical meeting summary
Length:  200 ~ 300
Tasks:
- highlight action items and owners
- highlight the agreements
- Use bullet points if needed
{text}
CONCISE SUMMARY IN ENGLISH:"""
    PROMPT = PromptTemplate(template=prompt_template, input_variables=["text"])

    # Refine prompt for iterative summarization
    refine_template = (
        "Your job is to produce a final summary\n"
        "We have provided an existing summary up to a certain point: {existing_answer}\n"
        "We have the opportunity to refine the existing summary"
        "(only if needed) with some more context below.\n"
        "------------\n"
        "{text}\n"
        "------------\n"
        f"Given the new context, refine the original summary in English within {target_len} words: following the format"
        "Participants: <participants>"
        "Discussed: <Discussed-items>"
        "Follow-up actions: <a-list-of-follow-up-actions-with-owner-names>"
        "If the context isn't useful, return the original summary. Highlight agreements and follow-up actions and owners."
    )
    refine_prompt = PromptTemplate(
        input_variables=["existing_answer", "text"],
        template=refine_template,
    )

    # Create the refine chain
    chain = load_summarize_chain(
        llm,
        chain_type="refine",
        return_intermediate_steps=True,
        question_prompt=PROMPT,
        refine_prompt=refine_prompt,
    )

    # Run the chain and return the summarized minutes
    resp = chain({"input_documents": docs}, return_only_outputs=True)
    return resp["output_text"]

# print(minutes_meet("""
# Meeting Transcript

# John: Good morning, everyone. I hope you all had a great weekend. Let’s get started with today’s meeting. We have several points to cover, including project updates, resource allocation, and upcoming deadlines. Before we dive in, let’s quickly go around the room and check in with everyone. Sarah, do you want to start?

# Sarah: Sure, thanks, John. Good morning, everyone. I’ve been working on the client deliverables for the past week, and I have some updates to share. We’ve successfully completed phase one of the project and are moving into phase two. There are a few minor issues that came up, but we are working on solutions.

# John: That’s good to hear, Sarah. Can you elaborate on the issues you’re facing?

# Sarah: Of course. One of the key challenges is related to data inconsistencies. Some of the input data we received from the client isn’t formatted correctly, which has led to a few delays. We are currently working with their team to resolve this, but it has impacted our timeline slightly.

# Mark: I’d like to add something to this. We encountered similar issues in a previous project, and what worked for us was setting up a preprocessing script to standardize all incoming data. Maybe we could try implementing something similar here?

# Sarah: That’s a great idea, Mark. I’ll discuss it with the team and see how we can integrate that into our workflow.

# John: That sounds like a good plan. Let’s ensure that we keep the client updated on any delays so they’re aware of the situation. Moving on, Jake, can you give us a quick update on the software development side?

# Jake: Absolutely. We’ve been making good progress on the backend development. The authentication module is nearly complete, and we are starting integration testing this week. One issue we’ve been dealing with is performance optimization—some of the database queries are taking longer than expected.

# John: That’s something we should definitely look into. Have you identified the bottlenecks?

# Jake: Yes, we suspect that it’s due to inefficient indexing on some of the tables. We are working on optimizing the queries and adding proper indexes. If necessary, we might need to restructure a few tables for better performance.

# Mark: If you need any help with that, let me know. I’ve worked on a similar problem before and might have some insights.

# Jake: That would be great, Mark. I’ll schedule some time with you later today to go over it.

# John: Perfect. Collaboration is key. Now, let’s move on to the next agenda item—resource allocation. We have a few new projects coming in, and we need to ensure that we have the right people assigned. Lisa, do you have an update on the current workload distribution?

# Lisa: Yes, I do. Based on our current assignments, most teams are at about 80% capacity. However, we are slightly overallocated on the design team, particularly with the new client project that just came in. We may need to either hire additional resources or redistribute some tasks.

# John: That’s something we need to address immediately. Do we have any flexibility with shifting design tasks to another team?

# Lisa: Possibly. I’ll need to coordinate with the development team to see if some of the minor UI work can be handled by them instead of the design team.

# Jake: I think we can manage that. If the UI components are straightforward, we can have a few frontend developers handle them.

# Lisa: That would be helpful. I’ll set up a follow-up discussion with you to go over the specifics.

# John: Great. Let’s ensure that we have a solution in place by the end of the week. Next, let’s talk about upcoming deadlines. We have a major milestone next month, and I want to make sure we’re on track. Rachel, can you provide an overview of where we stand?

# Rachel: Certainly. The milestone involves the completion of three major deliverables: the client dashboard, the reporting module, and the data integration pipeline. Currently, we are about 70% done with the dashboard, 50% done with the reporting module, and 60% done with the integration pipeline.

# John: That’s good progress. Do you foresee any potential risks that could impact our timeline?

# Rachel: The main risk right now is the data integration pipeline. Since we are dependent on external APIs, any delays on their end could slow us down. We’ve already had one minor delay last week due to an API outage.

# John: That’s a valid concern. Do we have a contingency plan in place?

# Rachel: We’ve started building a caching mechanism to mitigate some of these issues. That way, even if there’s a temporary outage, we can continue working with the last known data.

# Mark: That’s a smart approach. I’d also recommend having an alert system in place to notify us of any API failures immediately so we can take action quickly.

# Rachel: That’s a good suggestion. I’ll coordinate with the team to implement that.

# John: Sounds good. Let’s keep a close eye on this and have a status update in our next meeting. Before we wrap up, does anyone have any other business to discuss?

# Emily: I have one quick update regarding the training sessions. We’ve finalized the schedule for next month’s internal workshops. The topics will include advanced SQL optimization, UI/UX best practices, and an introduction to machine learning for product development.

# John: That’s excellent. Do we need to allocate any additional resources for these sessions?

# Emily: Not at the moment. The trainers are already confirmed, and we have enough slots for attendees.

# John: That’s great. Thanks for organizing this, Emily. If there’s nothing else, let’s conclude today’s meeting. Thanks, everyone, for your updates and input. Let’s stay on track and keep up the good work.
# John: Before we wrap up completely, I want to quickly check on the client feedback for the last deliverable. Has anyone received any direct responses from the client regarding phase one?

# Sarah: Yes, I did. They were mostly positive about the progress we’ve made so far. However, they did mention a couple of areas where they’d like to see some improvements. One of the key points they brought up was the user experience—some of the elements on the dashboard are not as intuitive as they expected.

# John: That’s good to know. Did they provide specific examples?

# Sarah: Yes, they pointed out that the navigation between different reports is a bit confusing. They expected a more seamless transition, and currently, it requires too many clicks to move from one section to another.

# Jake: That sounds like a UX issue. We can probably simplify the workflow and add quick-access buttons to make navigation smoother.

# Lisa: That would be helpful. I’ll have the design team look into this and propose some solutions by the end of the week.

# John: Good. Let’s make sure that any design changes align with the overall product vision. Mark, do you have any thoughts on this from a technical perspective?

# Mark: I think we can make some backend adjustments to support faster transitions between different reports. Right now, each report is being loaded independently, which is causing a slight delay. If we prefetch some of the commonly accessed reports, it could improve the experience significantly.

# John: That sounds promising. Can you put together a plan for this and share it with the team?

# Mark: Absolutely. I’ll draft something by tomorrow and send it over.

# John: Perfect. Now, moving on to operational updates. Lisa, do we have any pending action items from last week that still need attention?

# Lisa: Yes, there are a few. First, we still need to finalize the budget allocation for the next quarter. We had a preliminary discussion last week, but we need to lock down the numbers.

# John: Right, that’s an important one. What’s holding us back from finalizing it?

# Lisa: We are waiting for the latest financial reports from the finance team. Once we have those, we can make the final adjustments.

# John: When can we expect those reports?

# Lisa: By the end of this week, hopefully. I’ll follow up with finance to make sure we get them on time.

# John: Sounds good. Let’s aim to finalize the budget by next Monday’s meeting. Anything else on your list?

# Lisa: Yes, we also need to discuss the hiring plan for the next quarter. Based on our current workload, we might need to bring in additional resources, particularly in the development and data analysis teams.

# John: That’s a good point. How many new hires are we looking at?

# Lisa: Tentatively, we are considering hiring two developers and one data analyst.

# John: Do we already have job descriptions ready?

# Lisa: Not yet, but I can work with HR to get them drafted this week.

# John: Let’s make that a priority. Also, once the job postings are live, I want to make sure we actively participate in the screening process to ensure we get the right candidates.

# Lisa: Absolutely. I’ll coordinate with HR and update you by the end of the week.

# John: Great. Now, let’s talk about upcoming client meetings. Sarah, do we have any major client calls scheduled for this week?

# Sarah: Yes, we have a status update call with the client on Thursday. They are expecting a detailed progress report along with a demo of the latest features we’ve implemented.

# John: Who will be presenting?

# Sarah: I’ll be leading the presentation, but I’d like Jake and Mark to join as well in case there are any technical questions.

# Jake: That works for me. I’ll make sure to prepare a demo of the latest backend updates.

# Mark: Same here. I’ll be ready to answer any technical queries related to performance improvements.

# John: Sounds like a solid plan. Let’s make sure the presentation is polished and that we anticipate any potential questions the client might have.

# Sarah: I’ll set up a dry run on Wednesday so we can review everything before the actual call.

# John: Excellent. Now, before we close, let’s quickly go over any additional concerns or issues that anyone wants to bring up.

# Emily: I have a quick question about the internal documentation process. Right now, we have a lot of updates happening across multiple teams, and sometimes, it’s hard to track all the changes. Do we have a centralized documentation strategy in place?

# John: That’s a valid concern. Right now, we are maintaining separate documentation for each project, but it might be a good idea to consolidate everything into a central repository.

# Mark: I agree. A shared knowledge base would be beneficial, especially for onboarding new team members.

# Jake: Maybe we can set up a Wiki or use a platform like Confluence to keep everything in one place.

# John: That’s a good idea. Let’s explore our options and decide on a solution by next week. Emily, can you take the lead on this and suggest a few platforms that we could use?

# Emily: Absolutely. I’ll do some research and present my findings in the next meeting.

# John: Sounds good. Alright, if there’s nothing else, let’s wrap up. Thanks, everyone, for your input and updates. Let’s stay on top of our action items, and I’ll see you all in our next meeting.

# """))