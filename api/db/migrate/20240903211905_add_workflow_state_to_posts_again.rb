class AddWorkflowStateToPostsAgain < ActiveRecord::Migration[7.2]
  def change
    add_column :posts, :workflow_state, :string, null: false, default: "published"
    add_index :posts, :workflow_state
  end
end
