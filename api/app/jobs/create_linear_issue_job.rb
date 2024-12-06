# frozen_string_literal: true

class CreateLinearIssueJob < BaseJob
  sidekiq_options queue: "critical", retry: 1

  sidekiq_retries_exhausted do |msg|
    _issue_json, subject_type, subject_public_id, member_id = msg["args"]

    CreateLinearIssueJob.new.send_pusher_event(
      external_record: nil,
      subject_type: subject_type,
      subject_public_id: subject_public_id,
      member_id: member_id,
      status: CreateLinearIssueSerializer::FAILED,
    )
  end

  def perform(issue_json, subject_type, subject_public_id, member_id)
    issue_data = JSON.parse(issue_json)
    subject = subject_type.constantize.find_by(public_id: subject_public_id)
    member = OrganizationMembership.includes(:user).find(member_id)
    integration = member.organization.linear_integration

    issue_title = issue_data.dig("title")&.strip
    issue_description = issue_data.dig("description")&.strip
    team_id = issue_data.dig("team_id")

    attachment_title = if subject_type == "Post"
      subject.display_title || "Campsite post"
    elsif subject_type == "Comment"
      subject.subject.display_title.present? ? "#{subject.subject.display_title} (Comment)" : "Campsite comment"
    end
    attachment_subtitle = if subject_type == "Post"
      subject.plain_description_text
    elsif subject_type == "Comment"
      subject.plain_body_text
    end

    linear_client = LinearClient.new(integration.token)

    issue = linear_client.issues.create(
      title: issue_title,
      description: issue_description,
      team_id: team_id,
      member: member,
    )

    begin
      linear_client.attachments.create(
        issue_id: issue["id"],
        title: attachment_title,
        subtitle: attachment_subtitle,
        url: subject.url,
      )
    rescue => e
      Sentry.capture_exception(e)
    end

    external_record = ExternalRecord.create!(
      service: "linear",
      remote_record_id: issue["id"],
      remote_record_title: issue["title"],
      metadata: {
        type: ::LinearEvents::CreateIssue::TYPE,
        url: issue["url"],
        identifier: issue["identifier"],
        description: issue["description"],
        state: issue["state"],
      },
    )

    TimelineEvent.create!(
      actor: member,
      subject: subject,
      reference: external_record,
      action: action(subject_type),
    )

    send_pusher_event(
      external_record: external_record,
      subject_type: subject_type,
      subject_public_id: subject_public_id,
      member: member,
      status: CreateLinearIssueSerializer::SUCCESS,
    )
  end

  def send_pusher_event(external_record:, subject_type:, subject_public_id:, member_id: nil, member: nil, status:)
    member ||= OrganizationMembership.includes(:user).find(member_id)

    payload = CreateLinearIssueSerializer.preload_and_render({
      external_record: external_record,
      status: status,
    })

    # NOTE: the client assumes the structure and uniqueness of this event name
    event_name = "linear-issue-create:#{subject_type}:#{subject_public_id}"

    Pusher.trigger(
      member.user.channel_name,
      event_name,
      payload,
      { socket_id: Current.pusher_socket_id }.compact,
    )
  end

  private

  def action(subject_type)
    case subject_type
    when "Post"
      :created_linear_issue_from_post
    when "Comment"
      :created_linear_issue_from_comment
    end
  end
end
