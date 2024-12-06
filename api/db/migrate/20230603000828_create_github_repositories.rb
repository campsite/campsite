class CreateGithubRepositories < ActiveRecord::Migration[7.0]
  def change
    create_table :github_repositories, id: { type: :bigint, unsigned: true } do |t|
      t.bigint :provider_repository_id, null: false, unsigned: true
      t.string :full_name, null: false
      t.boolean :private, null: false, default: false
      t.references :integration, null: false, unsigned: true
      t.string :public_id, limit: 12

      t.timestamps
    end
  end
end
