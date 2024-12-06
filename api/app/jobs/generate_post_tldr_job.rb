# frozen_string_literal: true

class GeneratePostTldrJob < BaseJob
  sidekiq_options queue: "critical", retry: 2

  sidekiq_retries_exhausted do |msg|
    post_public_id, member_id = msg["args"]
    GeneratePostTldrJob.send_pusher_event(
      post_public_id: post_public_id,
      member_id: member_id,
      status: GeneratedHtmlSerializer::FAILED,
    )
  end

  def perform(post_public_id, member_id)
    post = Post.eager_load_llm_content.find_by!(public_id: post_public_id)
    member = OrganizationMembership.eager_load(:user).find(member_id)
    prompt = post.generate_tldr_prompt
    chat_response = Llm.new.chat(messages: prompt)

    html = StyledText.new(Rails.application.credentials.dig(:styled_text_api, :authtoken))
      .markdown_to_html(markdown: chat_response, editor: "markdown")

    # prevent inserting duplicate responses without a unique index
    llm_response = LlmResponse.find_or_create_by_prompt!(
      subject: post,
      prompt: prompt,
      response: html,
    )

    GeneratePostTldrJob.send_pusher_event(
      post_public_id: post_public_id,
      member: member,
      status: GeneratedHtmlSerializer::SUCCESS,
      html: html,
      response_id: llm_response.public_id,
    )
  end

  def self.send_pusher_event(post_public_id:, member_id: nil, member: nil, status:, html: nil, response_id: nil)
    member ||= OrganizationMembership.includes(:user).find(member_id)

    payload = GeneratedHtmlSerializer.preload_and_render(
      {
        status: status,
        html: html,
        response_id: response_id,
      },
      member: member,
      user: member.user,
    )

    # NOTE: the client assumes the structure and uniqueness of this event name
    event_name = "post-tldr-generation:#{post_public_id}"

    Pusher.trigger(
      member.user.channel_name,
      event_name,
      payload,
      { socket_id: Current.pusher_socket_id }.compact,
    )
  end
end
