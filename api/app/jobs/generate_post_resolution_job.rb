# frozen_string_literal: true

class GeneratePostResolutionJob < BaseJob
  sidekiq_options queue: "critical", retry: 2

  sidekiq_retries_exhausted do |msg|
    post_public_id, member_id, comment_public_id = msg["args"]
    GeneratePostResolutionJob.new.send_pusher_event(
      post_public_id: post_public_id,
      comment_public_id: comment_public_id,
      member_id: member_id,
      status: GeneratedHtmlSerializer::FAILED,
    )
  end

  def perform(post_public_id, member_id, comment_public_id = nil)
    post = Post.eager_load_llm_content.find_by!(public_id: post_public_id)
    comment = comment_public_id.present? ? post.kept_comments.eager_load_user.find_by(public_id: comment_public_id) : nil

    prompt = post.generate_resolution_prompt(comment)
    response = Llm.new.chat(messages: prompt)

    html = StyledText.new(Rails.application.credentials.dig(:styled_text_api, :authtoken))
      .markdown_to_html(markdown: response, editor: "markdown")

    # prevent inserting duplicate responses without a unique index
    response = LlmResponse.find_or_create_by_prompt!(
      subject: post,
      prompt: prompt,
      response: html,
    )

    send_pusher_event(
      post_public_id: post_public_id,
      comment_public_id: comment_public_id,
      member_id: member_id,
      status: GeneratedHtmlSerializer::SUCCESS,
      html: html,
      response_id: response.public_id,
    )
  end

  def send_pusher_event(post_public_id:, member_id:, comment_public_id:, status:, html: nil, response_id: nil)
    member = OrganizationMembership.includes(:user).find(member_id)

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
    event_name = "post-resolution-generation:#{post_public_id}"
    if comment_public_id.present?
      event_name += ":#{comment_public_id}"
    end

    Pusher.trigger(
      member.user.channel_name,
      event_name,
      payload,
      { socket_id: Current.pusher_socket_id }.compact,
    )
  end
end
