class AddCreatorIdToOauthApplications < ActiveRecord::Migration[7.2]
  def change
    add_reference :oauth_applications, :creator, type: :bigint, unsigned: true
  end
end
