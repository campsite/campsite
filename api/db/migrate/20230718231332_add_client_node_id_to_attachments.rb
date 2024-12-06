class AddClientNodeIdToAttachments < ActiveRecord::Migration[7.0]
  def change
    add_column :attachments, :client_node_id, :string
    add_index :attachments, :client_node_id
  end
end
