class MakeWebPushSubscriptionsEndpointText < ActiveRecord::Migration[7.1]
  def up
    change_column :web_push_subscriptions, :endpoint, :text, null: false
  end

  def down
    change_column :web_push_subscriptions, :endpoint, :string, null: false
  end
end
