class AddCreatorSourceToOrganizations < ActiveRecord::Migration[7.2]
  def change
    add_column :organizations, :creator_source, :string
  end
end
