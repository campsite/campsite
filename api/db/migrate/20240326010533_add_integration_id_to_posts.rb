class AddIntegrationIdToPosts < ActiveRecord::Migration[7.1]
  def change
    add_reference :posts, :integration, unsigned: true
  end
end
