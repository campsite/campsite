class AddContributorsCountToProjects < ActiveRecord::Migration[7.0]
  def self.up
    add_column :projects, :contributors_count, :integer, null: false, default: 0
  end

  def self.down
    remove_column :projects, :contributors_count
  end
end
