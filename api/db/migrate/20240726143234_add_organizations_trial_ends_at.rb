class AddOrganizationsTrialEndsAt < ActiveRecord::Migration[7.1]
  def change
    add_column :organizations, :trial_ends_at, :datetime
  end
end
