"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import ArchiveHeader from "../../components/common/ArchiveHeader";
import ArchiveSearchBar from "../../components/common/ArchiveSearchBar";
import ArchiveStatusMessage from "../../components/common/ArchiveStatusMessage";
import client from "../../api/client";
import { getMyPage, MyPageUser } from "../../api/mypage";
import { getRecipeDetail } from "../../api/recipe";
import { useKurchiveI18n } from "../../i18n/LocaleContext";
import RecipeFavoriteCard, { FavoriteRecipeItem } from "./components/RecipeFavoriteCard";
import styles from "./page.module.css";

const hydrateRecipeThumbnails = async (
  recipes: FavoriteRecipeItem[],
): Promise<FavoriteRecipeItem[]> => {
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
        console.error("Failed to load favorite recipe thumbnail:", error);
        return recipe;
      }
    }),
  );
};

export default function RecipeArchivePage() {
  const navigate = useNavigate();
  const { messages } = useKurchiveI18n();
  const archive = messages.archiveCommon;

  const [user, setUser] = useState<MyPageUser | null>(null);
  const [recipes, setRecipes] = useState<FavoriteRecipeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [userData, recipesRes] = await Promise.all([
          getMyPage(),
          client.get<FavoriteRecipeItem[]>("/mypage/logs/favorite-recipes"),
        ]);

        setUser(userData);
        const recipesData = Array.isArray(recipesRes.data) ? recipesRes.data : [];
        const hydratedRecipes = await hydrateRecipeThumbnails(recipesData);
        setRecipes(hydratedRecipes);
      } catch (error) {
        console.error("Failed to load favorite recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredRecipes = useMemo(
    () =>
      recipes.filter((r) =>
        r.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ),
    [recipes, searchQuery]
  );

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm(archive.removeConfirm)) return;

    try {
      await client.post(`/recipe/${id}/favorite`);
      setRecipes((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to remove favorite recipe:", error);
      alert(archive.removeRecipeFailed);
    }
  };

  const emptyMessage = searchQuery
    ? archive.noSearchResults
    : archive.noSavedRecipes;

  return (
    <div className={styles.container}>
      <ArchiveHeader
        classNames={styles}
        onBack={() => navigate(-1)}
        onMyPage={() => navigate("/mypage")}
      />

      <div className={styles.pageTitle}>
        {archive.savedRecipesTitle.replace(
          "{nickname}",
          user?.nickname || archive.userFallback
        )}
      </div>

      <ArchiveSearchBar
        classNames={styles}
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={archive.searchFavorites}
        icon={<FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />}
      />

      <div className={styles.restaurantList}>
        {loading ? (
          <ArchiveStatusMessage variant="loading">{messages.common.loading}</ArchiveStatusMessage>
        ) : filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <RecipeFavoriteCard key={recipe.id} recipe={recipe} onDelete={handleDeleteItem} />
          ))
        ) : (
          <ArchiveStatusMessage variant="empty">{emptyMessage}</ArchiveStatusMessage>
        )}
      </div>
    </div>
  );
}
