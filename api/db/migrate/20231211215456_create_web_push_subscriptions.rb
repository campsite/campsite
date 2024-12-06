class CreateWebPushSubscriptions < ActiveRecord::Migration[7.1]
  def change
    create_table :web_push_subscriptions, id: { type: :bigint, unsigned: true } do |t|
      t.references :user, null: false, unsigned: true
      t.string :endpoint, null: false
      t.string :p256dh, null: false
      t.string :auth, null: false

      t.timestamps
    end
  end
end
