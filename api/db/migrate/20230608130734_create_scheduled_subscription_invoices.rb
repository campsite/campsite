class CreateScheduledSubscriptionInvoices < ActiveRecord::Migration[7.0]
  def change
    create_table :scheduled_subscription_invoices, id: { type: :bigint, unsigned: true } do |t|
      t.references :organization, null: false, unsigned:true
      t.string :stripe_subscription_id, null: false
      t.datetime :scheduled_for, null: false
      t.datetime :payment_attempted_at

      t.timestamps
    end
  end
end
