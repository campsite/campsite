class RemoveOrganizationsStripeCustomerId < ActiveRecord::Migration[7.2]
  def change
    remove_column :organizations, :stripe_customer_id, :string
  end
end
