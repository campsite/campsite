class AddCreatorWhyToOrganizations < ActiveRecord::Migration[7.2]
  def change
    add_column :organizations, :creator_why, :text
  end
end
