"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./page.module.css";
import { getMyPage, MyPageUser, getMyUploadedRecipes, MyRecipeLog } from "../../api/mypage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import ArchiveHeader from "../../components/common/ArchiveHeader";
import ArchiveItemCard from "../../components/common/ArchiveItemCard";
import ArchiveSearchBar from "../../components/common/ArchiveSearchBar";
import ArchiveStatusMessage from "../../components/common/ArchiveStatusMessage";
import { useKurchiveI18n } from "../../i18n/LocaleContext";
import { getRecipeDetail } from "../../api/recipe";

const hydrateRecipeThumbnails = async (
  recipes: MyRecipeLog[],
): Promise<MyRecipeLog[]> => {
  return Promise.all(
    recipes.map(async (recipe) => {
      if (recipe.thumbnail_url) return recipe;

      try {
        // thumbnail fallback
        const detail = await getRecipeDetail(recipe.id);

        return {
          ...recipe,
          thumbnail_url: detail?.thumbnail_url || recipe.thumbnail_url,
        };
      } catch (error) {
        console.error("Failed to load recipe thumbnail:", error);
        return recipe;
      }
    }),
  );
};

const RecipeCard = ({ recipe }: { recipe: MyRecipeLog }) => {
  const navigate = useNavigate();
  const { messages } = useKurchiveI18n();
  const archive = messages.archiveCommon;
  const dateText = recipe.created_at
    ? new Date(recipe.created_at).toLocaleDateString()
    : "";

  return (
    <ArchiveItemCard
      title={recipe.title}
      description={archive.serves.replace("{count}", String(recipe.base_serving))}
      metaLabel={archive.uploadedByMe}
      dateText={dateText}
      imageLabel={messages.common.noPhoto}
      thumbnailUrl={recipe.thumbnail_url}
      onClick={() => navigate(`/recipe/${recipe.id}`)}
    />
  );
};

export default function RecipeArchivePage() {
  const navigate = useNavigate();
  const { messages } = useKurchiveI18n();
  const archive = messages.archiveCommon;

  const [user, setUser] = useState<MyPageUser | null>(null);
  const [recipes, setRecipes] = useState<MyRecipeLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [userData, recipesData] = await Promise.all([
          getMyPage(),
          getMyUploadedRecipes(),
        ]);

        setUser(userData);
        const hydratedRecipes = await hydrateRecipeThumbnails(recipesData);
        setRecipes(hydratedRecipes);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className={styles.container}>
      <ArchiveHeader
        classNames={styles}
        onBack={() => navigate(-1)}
        onMyPage={() => navigate("/mypage")}
      />

      <div className={styles.pageTitle}>
        {archive.recipeArchiveTitle.replace(
          "{nickname}",
          user?.nickname || archive.userFallback
        )}
      </div>

      <ArchiveSearchBar
        classNames={styles}
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={archive.searchMyRecipes}
        icon={<FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />}
      />

      <div className={styles.restaurantList}>
        {loading ? (
          <ArchiveStatusMessage variant="loading">{messages.common.loading}</ArchiveStatusMessage>
        ) : filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)
        ) : (
          <ArchiveStatusMessage variant="empty">
            {searchQuery
              ? archive.noSearchResults
              : archive.noUploadedRecipes}
          </ArchiveStatusMessage>
        )}
      </div>
    </div>
  );
}
