# frozen_string_literal: true

class SendFeedbackToPlainJob < BaseJob
  sidekiq_options queue: "background"

  FEEDBACK_LABEL_TYPE_ID = Rails.env.production? ? "lt_01J79N22ZWEW9S8ZMGQJTZ25SW" : "lt_01HKXK5B9WTSVHQ95HGQVNATYW"

  def perform(feedback_id)
    feedback = Feedback.find(feedback_id)
    user = feedback.user
    upsert_plain_customer(user: user)
    plain_client.create_thread(
      customer_external_id: user.id.to_s,
      title: "Campsite feedback from #{user.display_name}",
      components: feedback.plain_components,
      label_type_ids: [SendFeedbackToPlainJob::FEEDBACK_LABEL_TYPE_ID],
    )
    feedback.update!(sent_to_plain_at: Time.current)
  end

  private

  def upsert_plain_customer(user:)
    plain_client.upsert_customer(external_id: user.id.to_s, full_name: user.display_name, short_name: user.username, email: user.email)
  rescue PlainClient::CustomerAlreadyExistsWithEmailError
    plain_client.upsert_customer(external_id: user.id.to_s, full_name: user.display_name, short_name: user.username, email: user.email, identifier: :email_address)
  end

  def plain_client
    @plain_client ||= PlainClient.new(api_key: Rails.application.credentials.dig(:plain, :api_key))
  end
end
