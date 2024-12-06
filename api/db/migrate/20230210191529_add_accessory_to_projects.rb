class AddAccessoryToProjects < ActiveRecord::Migration[7.0]
  def change
    add_column :projects, :accessory, :string
  end
end
