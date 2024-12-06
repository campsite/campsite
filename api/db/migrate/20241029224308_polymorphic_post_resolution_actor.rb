class PolymorphicPostResolutionActor < ActiveRecord::Migration[7.2]
  def change
    add_column :posts, :resolved_by_type, :string, default: "OrganizationMembership"

    remove_index :posts, column: :resolved_by_id
    add_index :posts, [:resolved_by_id, :resolved_by_type]
  end
end
