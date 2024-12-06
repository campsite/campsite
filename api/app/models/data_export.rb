# frozen_string_literal: true

class DataExport < ApplicationRecord
  include PublicIdGenerator
  include ImgixUrlBuilder
  include Rails.application.routes.url_helpers

  belongs_to :member, class_name: "OrganizationMembership"
  belongs_to :subject, polymorphic: true
  has_many :resources, class_name: "DataExportResource", dependent: :destroy

  def completed?
    completed_at.present?
  end

  def perform
    create_resources
    queue_resource_jobs
  end

  def create_resources
    case subject_type
    when "Organization"
      create_org_users_resource
      create_org_projects_resource
    when "OrganizationMembership"
      create_org_membership_resource
    when "Project"
      create_org_project_resource
    end
  end

  def create_org_users_resource
    resources.find_or_create_by!(resource_type: "users")
  end

  def create_org_projects_resource
    subject.projects.not_private.find_each do |project|
      resources.find_or_create_by!(resource_type: "project", resource_id: project.id)
      create_org_posts_resource(project)
      create_org_notes_resource(project)
      create_org_calls_resource(project)
    end
  end

  def create_org_posts_resource(project)
    project.kept_published_posts
      .eager_load(:attachments, kept_comments: :attachments)
      .find_each(batch_size: 50) do |post|
      resources.find_or_create_by!(resource_type: "post", resource_id: post.id)
      create_post_attachments_resource(post)
    end
  end

  def create_post_attachments_resource(post)
    attachments = post.attachments.to_a + post.kept_comments.flat_map(&:attachments)
    attachments.each do |attachment|
      resources.find_or_create_by!(resource_type: "attachment", resource_id: attachment.id)
    end
  end

  def create_org_notes_resource(project)
    project.kept_notes
      .eager_load(:attachments, kept_comments: :attachments)
      .find_each(batch_size: 50) do |note|
      resources.find_or_create_by!(resource_type: "note", resource_id: note.id)
      create_org_note_attachments_resource(note)
    end
  end

  def create_org_note_attachments_resource(note)
    attachments = note.attachments.to_a + note.kept_comments.flat_map(&:attachments)
    attachments.each do |attachment|
      resources.find_or_create_by!(resource_type: "attachment", resource_id: attachment.id)
    end
  end

  def create_org_calls_resource(project)
    project.calls
      .eager_load(:recordings)
      .find_each do |call|
      resources.find_or_create_by!(resource_type: "call", resource_id: call.id)
      create_org_call_recordings_resource(call)
    end
  end

  def create_org_call_recordings_resource(call)
    call.recordings.each do |recording|
      resources.find_or_create_by!(resource_type: "call_recording", resource_id: recording.id)
    end
  end

  def create_org_membership_resource
    resources.find_or_create_by!(resource_type: "member", resource_id: subject.id)

    projects = []

    subject.kept_published_posts
      .eager_load(:attachments, kept_comments: :attachments)
      .find_each(batch_size: 50) do |post|
      resources.find_or_create_by!(resource_type: "post", resource_id: post.id)
      create_post_attachments_resource(post)
      projects << post.project
    end

    projects.uniq.compact.each do |project|
      resources.find_or_create_by!(resource_type: "project", resource_id: project.id)
    end
  end

  def create_org_project_resource
    resources.find_or_create_by!(resource_type: "project", resource_id: subject.id)
    create_org_posts_resource(subject)
    create_org_notes_resource(subject)
    create_org_calls_resource(subject)
  end

  def queue_resource_jobs
    resources.find_each.with_index do |resource, index|
      DataExportResourceJob.perform_in(0.1.seconds * index, resource.id)
    end
  end

  def check_completed
    return if resources.pending.exists?

    Rails.logger.info("Data export #{public_id} completed, triggering task")
    run_task
  end

  def run_task
    ecs_client.run_task(ecs_trigger_task_parameters)
  end

  def complete(zip_path)
    update!(zip_path: zip_path, completed_at: Time.current)

    OrganizationMailer.data_export_completed(self).deliver_later

    DataExportCleanupJob.perform_in(2.days, id)
  end

  def zip_url
    base = Rails.env.production? ? "https://d34kvjy7sxp73q.cloudfront.net" : "https://d3c2wobo23401l.cloudfront.net"
    "#{base}/#{zip_path}"
  end

  def cleanup!
    S3_BUCKET.object(zip_path).delete
    destroy!
  end

  def ecs_client
    @ecs_client ||= Aws::ECS::Client.new(
      region: "us-east-1",
      credentials: Aws::Credentials.new(
        Rails.application.credentials&.dig(:aws_ecs, :access_key_id),
        Rails.application.credentials&.dig(:aws_ecs, :secret_access_key),
      ),
    )
  end

  def upload_name
    case subject_type
    when "Organization"
      "export-#{subject.slug}-#{public_id}"
    when "OrganizationMembership"
      "export-#{subject.user.username}-#{public_id}"
    else
      public_id
    end
  end

  def ecs_trigger_task_parameters
    {
      cluster: "data-exporter",
      task_definition: "data-exporter-task-definition",
      launch_type: "FARGATE",
      network_configuration: {
        awsvpc_configuration: {
          subnets: [
            "subnet-0ed5fb13e3991a037",
            "subnet-0a9d14915d1c3bdca",
            "subnet-05a23b57917c8e6b3",
            "subnet-09046f9f795b2db39",
            "subnet-00b393c3e0ba449b9",
            "subnet-0f8134e2caa324f9b",
          ],
          security_groups: ["sg-0b31f01185b710e01"],
          assign_public_ip: "ENABLED",
        },
      },
      overrides: {
        container_overrides: [
          {
            name: "data-exporter-container",
            environment: [
              { name: "EXPORT_ID", value: public_id },
              { name: "BUCKET_NAME", value: Rails.application.credentials&.dig(:aws_ecs, :s3_bucket) },
              { name: "CALLBACK_URL", value: data_export_callback_url(public_id, host: Campsite.base_app_url.to_s, subdomain: Campsite.api_subdomain) },
              { name: "UPLOAD_NAME", value: upload_name },
            ],
          },
        ],
      },
    }
  end
end
