class DropAttachmentsClientNodeId < ActiveRecord::Migration[7.0]
  def change
    remove_column :attachments, :client_node_id, :string
  end
end
