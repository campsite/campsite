class AddOauthApplicationIdToPostsCommentsMessages < ActiveRecord::Migration[7.1]
  def change
    add_reference :comments, :oauth_application, type: :bigint, unsigned: true
    add_reference :messages, :oauth_application, type: :bigint, unsigned: true
    add_reference :posts, :oauth_application, type: :bigint, unsigned: true
  end
end
