class AddMemberCountToOrganizations < ActiveRecord::Migration[7.0]
  def change
    add_column :organizations, :member_count, :integer, null: false, default: 0
  end
end
