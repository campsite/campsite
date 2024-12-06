# frozen_string_literal: true

FactoryBot.define do
  factory :attachment do
    association :subject, factory: :comment
    file_type { "image/jpeg" }
    file_path { "/path/to/image.png" }

    trait :video do
      file_type { "video/mp4" }
      file_path { "/path/to/video.mp4" }
      preview_file_path { "/path/to/video.png" }
    end

    trait :origami do
      file_type { "origami" }
      file_path { "/path/to/prototype.origami" }
    end

    trait :principle do
      file_type { "principle" }
      file_path { "/path/to/prototype.prd" }
    end

    trait :lottie do
      file_type { "lottie" }
      file_path { "/path/to/lottie.json" }
    end

    trait :gif do
      file_type { "image/gif" }
      file_path { "/path/to/image.gif" }
    end

    trait :svg do
      file_type { "image/svg+xml" }
      file_path { "/path/to/image.svg" }
    end

    trait :figma_link do
      file_type { "link" }
      file_path { "https://www.figma.com/file/123456/My-File" }
    end

    trait :figma_node do
      figma_file
      remote_figma_node_id { "1:2" }
      remote_figma_node_type { :FRAME }
      remote_figma_node_name { Faker::Hobby.activity }
      width { 400 }
      height { 200 }
    end
  end
end
