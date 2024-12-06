class AddReferralToUser < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :referrer, :string, limit: 2048
    add_column :users, :landing_url, :string, limit: 2048
  end
end
