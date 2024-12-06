class AddSubjectToWebhookEvent < ActiveRecord::Migration[7.2]
  def change
    add_reference :webhook_events, :subject, polymorphic: true, index: true, unsigned: true, null: false
  end
end
