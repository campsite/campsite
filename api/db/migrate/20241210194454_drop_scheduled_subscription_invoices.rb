class DropScheduledSubscriptionInvoices < ActiveRecord::Migration[7.2]
  def change
    drop_table :scheduled_subscription_invoices, id: { type: :bigint, unsigned: true } do |t|
      t.bigint "organization_id", null: false, unsigned: true
      t.string "stripe_subscription_id", null: false
      t.datetime "scheduled_for", null: false
      t.datetime "payment_attempted_at"
      t.datetime "created_at", null: false
      t.datetime "updated_at", null: false
      t.index ["organization_id"], name: "index_scheduled_subscription_invoices_on_organization_id"
    end
  end
end
