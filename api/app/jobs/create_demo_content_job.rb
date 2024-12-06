# frozen_string_literal: true

class CreateDemoContentJob < BaseJob
  sidekiq_options queue: "background", retry: false

  def perform(org_slug)
    org = Organization.find_by(slug: org_slug)
    admin = org.admins.first

    begin
      DemoOrgs::Generator.new(admin: admin, org: org).update_content
    rescue => e
      Rails.logger.error("Error creating demo content for org #{org_slug}: #{e.message}")
      Rails.logger.error(e.backtrace)
    end
  end
end
