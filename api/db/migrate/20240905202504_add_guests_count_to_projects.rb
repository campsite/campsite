class AddGuestsCountToProjects < ActiveRecord::Migration[7.2]
  def change
    add_column :projects, :guests_count, :integer, default: 0, null: false
    ProjectMembership.counter_culture_fix_counts if Rails.env.development? && !ENV['ENABLE_PSDB']
  end
end
