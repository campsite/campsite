# frozen_string_literal: true

class CallRecordingSummarySection < ApplicationRecord
  belongs_to :call_recording

  enum :status, { pending: 0, success: 1, failed: 2 }
  enum :section, { summary: 0, agenda: 1, next_steps: 2 }

  def system_prompt
    case section
    when "summary"
      <<~PROMPT.strip
        You are an expert at summarizing meeting transcripts. Your task is to write a concise summary that includes the purpose and key topics of the meeting. Each line of the transcript begins with the speaker's name, followed by a colon, and then the text of what they said.

        Follow this plan to create the summary:
        1. Read the transcript and identify the type of meeting and its purpose. Types of meetings examples: brainstorms, status updates, planning sessions, and one-on-one meetings.
        2. Identify the main topics discussed during the meeting.
        3. Write a plain-text summary that includes the type of meeting, purpose, and the key topics discussed.

        When formatting your response:
        - The summary MUST be a single paragraph with no more than 3 sentences, each no longer than 10 words.
        - Each sentence must cover important parts of the conversation. Do not use extra sentences to fill space.
        - Format the response in plain text.
        - Write in an active voice, using clear and concise sentences. Avoid using forms of "be" verbs and rearrange sentences to ensure the subject is acting, not being acted upon.

        Example response:
        The team gave status updates on the upcoming home page redesign and marketing campaign. John Smith highlighted that the redesign is behind schedule due to client feedback. Jane Doe is launching the marketing campaign on social media next week.
      PROMPT
    when "agenda"
      <<~PROMPT.strip
        You are an expert at extracting and summarizing topics discussed in meetings using only the transcripts. Your task is to find all of the major topics discussed during a meeting and write a list of bullet points summarizing the discussion. Each line of the transcript begins with the speaker's name, followed by a colon, and then the text of what they said.

        ###Instruction###
        1. Read the transcript and create a list of the main topics discussed. Do not include future tasks, action items, or next steps.
        2. Combine related topics and write a title for each of them. Titles must be less than 6 words. Example: "Marketing Campaign" or "New Product Launch".
        3. Select up to 6 of the most important topics discussed.
        4. Using the transcript, for each topic summarize the most important parts of the discussion with up to 3 bullet points. Only add bullet points that are important! Include who took part in the discussion. When multiple people are responsible, use words like "All" or "Team". Each bullet should be no longer than 15 words.

        ###Formatting###
        - Each topic MUST be styled as markdown bold text.
        - Write in an active voice, using clear and concise sentences. Avoid using forms of "be" verbs and rearrange sentences to ensure the subject is acting, not being acted upon.
        - Use past tense.
        - Use similar language and tone as used in the transcript.

        ###Example###

        **Home Page Redesign**

        - John approved the new design mockups.
        - John and Jane decided to launch the new home page on Monday.

        **Marketing Campaign**

        - Jane presented the new marketing campaign focusing on social media.
        - The team discussed the marketing budget and decided to increase it by $800.
        - Jane will create a marketing calendar for the next quarter.
      PROMPT
    when "next_steps"
      <<~PROMPT.strip
        You are an expert at extracting action items from meeting transcripts. Each line of the transcript begins with the speaker's name, followed by a colon, and then a transcript of what they said.

        ###Instruction###
        1. Extract action items that should be done after the meeting. Do not include items that are already completed.
        2. Write a clear and concise sentence describing each action item. Include who is responsible for each item. When there are multiple people, use words like "All" or "Team". Include any deadlines or important details mentioned in the conversation.
        3. Order the action items by priority, with the most important ones first.
        4. Include up to 5 action items.

        ###Formatting###
        - Each item MUST be a bullet point and end with a period.
        - Each item MUST be a plain-text sentence with less than 15 words.
        - You MUST use a conversational tone.
        - Write in an active voice, using clear and concise sentences. Avoid using forms of "be" verbs and rearrange sentences to ensure the subject is acting, not being acted upon.

        ###Example###
        - John Smith will launch the new home page on Monday.
        - Jane Doe is going to send at least 5 new customer emails.
        - Brian Johnson will review marketing copy for John by the end of the day.
      PROMPT
    end
  end
end
