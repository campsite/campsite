# frozen_string_literal: true

class DataExportResource < ApplicationRecord
  belongs_to :data_export

  enum :resource_type, { users: 0, project: 1, post: 2, note: 3, call: 4, attachment: 5, call_recording: 6, member: 7 }
  enum :status, { pending: 0, completed: 1, error: 2 }

  def perform
    logger_id = resource_id.present? ? "-#{resource_id}" : ""
    Rails.logger.info("Performing data export resource #{data_export.public_id}/#{resource_type}#{logger_id}")

    case resource_type
    when "users"
      export_users
    when "project"
      export_project
    when "post"
      export_post
    when "attachment"
      export_attachment
    when "note"
      export_note
    when "call"
      export_call
    when "call_recording"
      export_call_recording
    when "member"
      export_member
    end

    update!(status: :completed, completed_at: Time.current)

    data_export.check_completed
  end

  def export_users
    users_json = data_export.subject.kept_memberships.eager_load(:user).map(&:export_json)
    write_to_s3("users.json", users_json.to_json)
  end

  def export_project
    project = Project.preload(:members).find(resource_id)
    write_to_s3("#{project.export_root_path}/channel.json", project.export_json.to_json)
  end

  def export_post
    post = Post.preload(
      :project,
      :integration,
      :oauth_application,
      member: :user,
      kept_comments: [member: :user, kept_replies: [member: :user]],
      resolved_by: :user,
      resolved_comment: [member: :user],
    ).find(resource_id)
    write_to_s3("#{post.export_root_path}/post.json", post.export_json.to_json)
  end

  def export_attachment
    attachment = Attachment.preload(:subject).find(resource_id)

    # Skip copying link attachments
    if attachment.link?
      return
    end

    path = case attachment.subject
    when Comment
      attachment.subject.subject.export_root_path
    else
      attachment.subject.export_root_path
    end

    path = "#{path}/#{attachment.export_file_name}"

    copy_to_s3(attachment.file_path, path)
  end

  def export_note
    note = Note.preload(member: :user, kept_comments: [member: :user, kept_replies: [member: :user]]).find(resource_id)
    write_to_s3("#{note.export_root_path}/note.json", note.export_json.to_json)
  end

  def export_call
    call = Call.preload(peers: :organization_membership).find(resource_id)
    write_to_s3("#{call.export_root_path}/call.json", call.export_json.to_json)
  end

  def export_call_recording
    recording = CallRecording.preload(:call).find(resource_id)
    base_path = "#{recording.call.export_root_path}/recordings"
    copy_to_s3(recording.file_path, "#{base_path}/#{recording.export_file_name}")
    write_to_s3("#{base_path}/#{recording.public_id}_transcription.vtt", recording.transcription_vtt)
  end

  def export_member
    write_to_s3("user.json", data_export.subject.export_json.to_json)
  end

  private

  def write_to_s3(path, body)
    S3_BUCKET.object("exports/#{data_export.public_id}/#{path}").put(body: body)
  end

  def copy_to_s3(source_path, target_path)
    source_object = S3_BUCKET.object(source_path)
    target_object = S3_BUCKET.object("exports/#{data_export.public_id}/#{target_path}")
    source_object.copy_to(target_object)
  rescue Aws::S3::Errors::NoSuchKey
    Sentry.capture_message("Failed to copy attachment: #{source_path} -> #{target_path}")
    update!(status: :error)
  end
end
