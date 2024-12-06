# frozen_string_literal: true

module Api
  module V1
    module Posts
      class PostVersionsController < PostsBaseController
        extend Apigen::Controller

        response model: PostVersionSerializer, is_array: true, code: 200
        def index
          authorize(current_post, :show?)

          render_json(PostVersionSerializer, current_post.root.self_and_descendants.limit(50))
        end

        response model: PostSerializer, code: 201
        def create
          authorize(current_post, :create_version?)

          post = Post.create_post(
            params: {
              title: current_post.title,
              description_html: RichText.new(current_post.description_html).strip_description_comments.to_s,
              status: current_post.status,
              feedback_request_member_ids: current_post.feedback_requests.map { |fr| fr.member.id },
              tags: current_post.tags.map(&:name),
              poll: if current_post.poll
                      {
                        description: current_post.poll.description,
                        options: current_post.poll.options.map { |option| { description: option.description } },
                      }
                    end,
              attachments: [],
              links: current_post.links.map do |link|
                {
                  name: link.name,
                  url: link.url,
                }
              end,
            },
            parent: current_post,
            project: current_post.project,
            organization: current_organization,
            member: current_organization_membership,
          )

          if post.errors.empty?
            render_json(PostSerializer, post.reload, status: :created)
          else
            render_unprocessable_entity(post)
          end
        end
      end
    end
  end
end
