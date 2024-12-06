# frozen_string_literal: true

class AddSlackMessageTsToNotifications < ActiveRecord::Migration[7.0]
  def change
    add_column(:notifications, :slack_message_ts, :string)
  end
end
