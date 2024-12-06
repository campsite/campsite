class AddNameAndSizeToAttachments < ActiveRecord::Migration[7.0]
  def change
    add_column :attachments, :name, :string
    add_column :attachments, :size, :integer
  end
end
