# frozen_string_literal: true

class ProductLogsJob < BaseJob
  sidekiq_options queue: "background"

  CAMPSITE_UA_REGEX = %r{Campsite/\S+}

  def perform(events, user_agent, custom_headers)
    device_info = if user_agent.present?
      user_agent_client = DeviceDetector.new(user_agent) if user_agent
      custom_headers = JSON.parse(custom_headers || "{}")

      info = {
        browser_name: user_agent_client.name,
        browser_version: user_agent_client.full_version,
        os_name: user_agent_client.os_name,
        os_version: user_agent_client.os_full_version,
        device_name: user_agent_client.device_name,
        device_type: user_agent_client.device_type,
        device_brand: user_agent_client.device_brand,
        is_desktop_app: false,
        is_pwa: custom_headers["x-campsite-pwa"].present?,
      }

      if (desktop_app_parts = user_agent.match(CAMPSITE_UA_REGEX))
        info[:is_desktop_app] = true
        info[:desktop_app_version] = desktop_app_parts[0].split("/")[1]
      end

      info
    else
      {}
    end

    fetched_subjects = {}

    events = events.map do |event|
      event["log_ts"] = Time.zone.at(event["log_ts"].to_i)
      event["device_info"] = device_info

      user_id = event.delete("user_id")
      org_slug = event.delete("org_slug")
      org_id = event.delete("org_id") || Organization.find_by(slug: org_slug)&.public_id

      if user_id.present? && org_id.present?
        key = user_id + org_id
        subject = if (match = fetched_subjects[key])
          match
        else
          OrganizationMembership
            .includes(:user, :organization)
            .find_by(user: { public_id: user_id }, organization: { public_id: org_id }) ||
            User.find_by(public_id: user_id)
        end
        fetched_subjects[key] = subject

        event["subject_id"] = subject.id
        event["subject_type"] = subject.class.to_s
      elsif user_id.present?
        key = user_id
        subject = fetched_subjects[key] || User.find_by(public_id: user_id)
        fetched_subjects[key] = subject

        event["subject_id"] = subject.id
        event["subject_type"] = subject.class.to_s
      elsif org_id.present?
        key = org_id
        subject = fetched_subjects[key] || Organization.find_by(public_id: org_id)
        fetched_subjects[key] = subject

        event["subject_id"] = subject.id
        event["subject_type"] = subject.class.to_s
      else
        event["subject_id"] = nil
        event["subject_type"] = nil
      end

      event
    end

    ProductLog.insert_all!(events)
  end
end

ProductLogsJob2 = ProductLogsJob
