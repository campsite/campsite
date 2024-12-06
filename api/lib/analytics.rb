# frozen_string_literal: true

class Analytics
  def initialize(user:, org_slug:, request:)
    @user = user
    @org_slug = org_slug
    @request = request
  end

  def track(event:, properties: {})
    ProductLogsJob.perform_async(
      [{
        user_id: @user&.public_id,
        org_id: @org&.public_id,
        name: event,
        data: properties,
        log_ts: Time.zone.now.to_i,
      }].as_json,
      @request&.user_agent,
      @request&.headers&.env&.transform_keys(&:downcase)&.select { |k, _v| k.start_with?("x-") }.to_json,
    )
  end

  private

  def org
    @org ||= Organization.find_by(slug: @org_slug) if @org_slug
  end
end
