class AddDurationToAttachments < ActiveRecord::Migration[7.0]
  def change
    add_column :attachments, :duration, :integer
  end
end
