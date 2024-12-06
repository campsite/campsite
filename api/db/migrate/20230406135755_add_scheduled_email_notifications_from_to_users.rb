# frozen_string_literal: true

class AddScheduledEmailNotificationsFromToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column(:users, :scheduled_email_notifications_from, :datetime)
  end
end
