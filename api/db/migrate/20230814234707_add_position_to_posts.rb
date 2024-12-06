class AddPositionToPosts < ActiveRecord::Migration[7.0]
  def change
    add_column :attachments, :position, :integer
  end
end
