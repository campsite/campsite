# frozen_string_literal: true

class OrganizationMembershipStatus < ApplicationRecord
  EXPIRATIONS = [:"30m", :"1h", :"4h", :today, :this_week, :custom].freeze

  belongs_to :organization_membership

  validates :message, presence: true
  validates :emoji, presence: true
  validates :expiration_setting, presence: true, inclusion: { in: EXPIRATIONS.map(&:to_s) }

  after_create :update_organization_membership_latest_status_id
  after_commit :update_user_notification_pause
  after_commit :trigger_update_status_job

  scope :active, -> { where("expires_at > ?", Time.current).or(where(expires_at: nil)) }
  scope :expired, -> { where("expires_at <= ?", Time.current) }

  def self.expiration(key)
    case key
    when "30m".to_sym
      30.minutes.from_now
    when "1h".to_sym
      1.hour.from_now
    when "4h".to_sym
      4.hours.from_now
    when :today
      Time.current.end_of_day
    when :this_week
      Time.current.end_of_week
    else
      raise "Invalid expiration key: #{key}"
    end
  end

  def expired?
    expires_at.present? && expires_at <= Time.current
  end

  def active?
    !expired?
  end

  private

  def update_organization_membership_latest_status_id
    organization_membership.update!(latest_status_id: id)
  end

  def update_user_notification_pause
    return unless organization_membership
    return unless pause_notifications || saved_change_to_pause_notifications?

    if pause_notifications && expires_at.after?(Time.current)
      organization_membership.user.pause_notifications!(expires_at: expires_at)
    else
      organization_membership.user.unpause_notifications!
    end
  end

  def trigger_update_status_job
    return unless organization_membership

    UpdateStatusJob.perform_async(organization_membership_id)
  end
end
