class AddPreviousContentColumnsToPostAndPostComment < ActiveRecord::Migration[7.0]
  def change
    add_column :posts, :previous_description, :text
    add_column :post_comments, :previous_body, :text

    reversible do |dir|
      dir.up do
        Post.in_batches do |posts|
          posts.update_all("previous_description = description")
        end

        PostComment.in_batches do |comments|
          comments.update_all("previous_body = body")
        end
      end
    end
  end
end
