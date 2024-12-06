class CreateUserSubscriptions < ActiveRecord::Migration[7.0]
  def change
    create_table :user_subscriptions, id: { type: :bigint, unsigned: true } do |t|
      t.string     :public_id, limit: 12, null: false, index: { unique: true }
      t.references :subscribable, polymorphic: true, unsigned: true, null: false
      t.references :user, null: false, unsigned: true
      t.timestamps
    end

    add_index :user_subscriptions, [:subscribable_type, :subscribable_id, :user_id], unique: true,
      name: :idx_user_subscriptions_on_subscribable_type_id_and_user_id
  end
end
