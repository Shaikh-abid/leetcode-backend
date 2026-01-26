from pymongo import MongoClient
from datetime import datetime

# --- CONFIGURATION ---
MONGO_URI = 'mongodb+srv://abidshaikhccc_db_user:ifJMzvYsRW2XHbp1@cluster0.dhwxx64.mongodb.net/' 
DB_NAME = 'leetcode' 
COLLECTION_NAME = 'problems'

# --- THE DATA ---
problems_data = [
  {
  "title": "Maximum Depth of Binary Tree",
  "slug": "maximum-depth-of-binary-tree",
  "description": "Given the `root` of a binary tree, return its maximum depth.\n\nA binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
  "difficulty": "easy",
  "constraints": "The number of nodes in the tree is in the range [0, 10^4].",
  "tags": [
    "Tree",
    "DFS",
    "Recursion"
  ],
  "companies": [
    "LinkedIn",
    "Google"
  ],
  "hints": [
    "Use recursion to find the max depth of left and right subtrees."
  ],
  "testCases": [
    {
      "input": "[3,9,20,-1,-1,15,7]",
      "output": "3",
      "explanation": "Note: -1 represents null in input for C++ compatibility."
    },
    {
      "input": "[1,-1,2]",
      "output": "2"
    }
  ],
  "starterCode": {
    "javascript": "/**\n * Definition for a binary tree node.\n * function TreeNode(val, left, right) {\n * this.val = (val===undefined ? 0 : val)\n * this.left = (left===undefined ? null : left)\n * this.right = (right===undefined ? null : right)\n * }\n */\n/**\n * @param {TreeNode} root\n * @return {number}\n */\nvar maxDepth = function(root) {\n    \n};",
    "python": "# Definition for a binary tree node.\n# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\nclass Solution:\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\n        pass",
    "java": "/**\n * Definition for a binary tree node.\n * public class TreeNode {\n * int val;\n * TreeNode left;\n * TreeNode right;\n * TreeNode() {}\n * TreeNode(int val) { this.val = val; }\n * TreeNode(int val, TreeNode left, TreeNode right) {\n * this.val = val;\n * this.left = left;\n * this.right = right;\n * }\n * }\n */\nclass Solution {\n    public int maxDepth(TreeNode root) {\n        return 0;\n    }\n}",
    "cpp": "/**\n * Definition for a binary tree node.\n * struct TreeNode {\n * int val;\n * TreeNode *left;\n * TreeNode *right;\n * TreeNode() : val(0), left(nullptr), right(nullptr) {}\n * TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n * TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n * };\n */\nclass Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        return 0;\n    }\n};"
  },
  "driverCode": {
    "javascript": "function TreeNode(val, left, right) {\n    this.val = (val===undefined ? 0 : val)\n    this.left = (left===undefined ? null : left)\n    this.right = (right===undefined ? null : right)\n}\nfunction createTree(arr) {\n    if (!arr || arr.length === 0 || arr[0] === -1) return null;\n    let root = new TreeNode(arr[0]);\n    let queue = [root];\n    let i = 1;\n    while (i < arr.length) {\n        let curr = queue.shift();\n        if (i < arr.length && arr[i] !== -1) {\n            curr.left = new TreeNode(arr[i]);\n            queue.push(curr.left);\n        }\n        i++;\n        if (i < arr.length && arr[i] !== -1) {\n            curr.right = new TreeNode(arr[i]);\n            queue.push(curr.right);\n        }\n        i++;\n    }\n    return root;\n}\ninputs.forEach((args) => {\n    const arr = args[0];\n    const root = createTree(arr);\n    console.log(maxDepth(root));\n});",
    "python": "import json\nimport collections\n\n# Definition for a binary tree node.\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\n##USER_CODE##\n\ndef create_tree(arr):\n    if not arr or arr[0] == -1: return None\n    root = TreeNode(arr[0])\n    queue = collections.deque([root])\n    i = 1\n    while i < len(arr):\n        curr = queue.popleft()\n        if i < len(arr) and arr[i] != -1:\n            curr.left = TreeNode(arr[i])\n            queue.append(curr.left)\n        i += 1\n        if i < len(arr) and arr[i] != -1:\n            curr.right = TreeNode(arr[i])\n            queue.append(curr.right)\n        i += 1\n    return root\n\n# FIX: Load the inputs from the placeholder string\ninputs = json.loads(##INPUTS##)\nsol = Solution()\nfor args in inputs:\n    # args is a list of arguments for one test case. \n    # The tree array is the first argument: args[0]\n    root = create_tree(args[0])\n    print(sol.maxDepth(root))",
    "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        \n        // 3D array (TestCases -> Arguments -> Data Array)\n        int[][][] inputs = ##INPUTS##;\n        \n        for(int[][] argsTuple : inputs) {\n             // Extract first argument (the tree array)\n             TreeNode root = createTree(argsTuple[0]);\n             System.out.println(sol.maxDepth(root));\n        }\n    }\n\n    public static TreeNode createTree(int[] arr) {\n        if (arr.length == 0 || arr[0] == -1) return null;\n        TreeNode root = new TreeNode(arr[0]);\n        Queue<TreeNode> q = new LinkedList<>();\n        q.add(root);\n        int i = 1;\n        while (i < arr.length) {\n            TreeNode curr = q.poll();\n            if (i < arr.length && arr[i] != -1) {\n                curr.left = new TreeNode(arr[i]);\n                q.add(curr.left);\n            }\n            i++;\n            if (i < arr.length && arr[i] != -1) {\n                curr.right = new TreeNode(arr[i]);\n                q.add(curr.right);\n            }\n            i++;\n        }\n        return root;\n    }\n}\n\nclass TreeNode {\n    int val;\n    TreeNode left;\n    TreeNode right;\n    TreeNode() {}\n    TreeNode(int val) { this.val = val; }\n    TreeNode(int val, TreeNode left, TreeNode right) {\n        this.val = val;\n        this.left = left;\n        this.right = right;\n    }\n}\n\n##USER_CODE##",
    "cpp": "#include <iostream>\n#include <vector>\n#include <queue>\nusing namespace std;\nstruct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode() : val(0), left(nullptr), right(nullptr) {}\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n};\n##USER_CODE##\nTreeNode* createTree(const vector<int>& arr) {\n    if (arr.empty() || arr[0] == -1) return nullptr;\n    TreeNode* root = new TreeNode(arr[0]);\n    queue<TreeNode*> q;\n    q.push(root);\n    size_t i = 1;\n    while (i < arr.size()) {\n        TreeNode* curr = q.front(); q.pop();\n        if (i < arr.size() && arr[i] != -1) {\n            curr->left = new TreeNode(arr[i]);\n            q.push(curr->left);\n        }\n        i++;\n        if (i < arr.size() && arr[i] != -1) {\n            curr->right = new TreeNode(arr[i]);\n            q.push(curr->right);\n        }\n        i++;\n    }\n    return root;\n}\nint main() {\n    Solution sol;\n    // FIX: Use 3D Vector because inputs are wrapped (TestCase -> Args -> Data)\n    vector<vector<vector<int>>> inputs = ##INPUTS##;\n    for(const auto& args : inputs) {\n        TreeNode* root = createTree(args[0]);\n        cout << sol.maxDepth(root) << endl;\n    }\n    return 0;\n}"
  },
  "solution": {
    "code": "var maxDepth = function(root) {\n    if (!root) return 0;\n    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n};",
    "explanation": "Recursive DFS: depth = 1 + max(left, right).",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)"
  }
}

]

# --- EXECUTION ---
def seed_db():
    try:
        # Connect
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]

        # 1. Insert new data
        print(f"Inserting {len(problems_data)} problems...")
        result = collection.insert_many(problems_data)

        print(f"✅ Success! Inserted {len(result.inserted_ids)} problems.")
        print(f"IDs: {result.inserted_ids}")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    seed_db()